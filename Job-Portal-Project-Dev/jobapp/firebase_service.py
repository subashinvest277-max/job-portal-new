from pathlib import Path
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
except Exception:  # pragma: no cover - handled at runtime
    firebase_admin = None
    credentials = None
    messaging = None


class PushNotificationError(Exception):
    """Base error for push notification failures."""


class InvalidFCMTokenError(PushNotificationError):
    """Raised when token is invalid/unregistered/expired."""


_firebase_app = None


def _get_service_account_path():
    configured_path = getattr(
        settings,
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        None
    )
    if configured_path:
        return Path(configured_path)

    return (
        Path(settings.BASE_DIR)
        / "jobapp"
        / "firebase"
        / "firebase-service-account.json"
    )


def get_firebase_app():
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    if firebase_admin is None:
        raise PushNotificationError(
            "firebase_admin is not installed."
        )

    service_account_path = _get_service_account_path()
    if not service_account_path.exists():
        raise PushNotificationError(
            f"Firebase service account file not found: "
            f"{service_account_path}"
        )

    try:
        existing_apps = getattr(
            firebase_admin,
            "_apps",
            []
        )
        if existing_apps:
            _firebase_app = firebase_admin.get_app()
            logger.info(
                "Firebase app reused successfully."
            )
            return _firebase_app

        cred = credentials.Certificate(
            str(service_account_path)
        )
        _firebase_app = firebase_admin.initialize_app(
            cred
        )
        logger.info(
            "Firebase app initialized successfully with "
            "service account path: %s",
            str(service_account_path)
        )
        return _firebase_app
    except Exception as exc:
        logger.exception(
            "Firebase app initialization failed."
        )
        raise PushNotificationError(
            f"Firebase initialization failed: {exc}"
        ) from exc


def _is_invalid_token_error(exc):
    if messaging is None:
        return False

    known_types = [
        getattr(messaging, "UnregisteredError", None),
        getattr(messaging, "SenderIdMismatchError", None),
        getattr(messaging, "InvalidArgumentError", None),
    ]
    for exc_type in known_types:
        if isinstance(exc_type, type) and isinstance(
            exc,
            exc_type
        ):
            return True

    error_text = str(exc).lower()
    invalid_markers = [
        "unregistered",
        "not a valid fcm registration token",
        "requested entity was not found",
        "invalid registration token",
        "registration token is not valid",
        "mismatched-credential",
    ]
    return any(marker in error_text for marker in invalid_markers)


def send_push_notification(
    token,
    title,
    body,
    data=None
):
    normalized_token = str(token or "").strip()
    if not normalized_token:
        raise InvalidFCMTokenError(
            "FCM token is empty."
        )

    app = get_firebase_app()

    payload_data = {}
    for key, value in (data or {}).items():
        payload_data[str(key)] = (
            "" if value is None else str(value)
        )

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=normalized_token,
            data=payload_data,
        )
        response_id = messaging.send(
            message,
            app=app
        )
        logger.info(
            "PUSH SENT | token_prefix=%s | title=%s | response_id=%s",
            normalized_token[:12],
            title,
            response_id
        )
        return response_id
    except Exception as exc:
        if _is_invalid_token_error(exc):
            raise InvalidFCMTokenError(str(exc)) from exc

        raise PushNotificationError(
            f"Push notification send failed: {exc}"
        ) from exc