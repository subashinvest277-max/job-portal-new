from rest_framework.permissions import BasePermission

class IsAdminOrEmployer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.user_type == "employer"
        )

# About Company
 
from rest_framework.permissions import BasePermission
 
 
class IsEmployerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (
                request.user.user_type == "employer" or
                request.user.is_staff  # admin
            )
        )

# Report A Job Permissions
 
from rest_framework.permissions import BasePermission
 
class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == "jobseeker"
 
 
class IsAdminUserType(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == "admin"  
 