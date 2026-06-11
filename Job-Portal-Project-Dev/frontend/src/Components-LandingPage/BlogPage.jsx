import React from 'react';
import './BlogPage.css';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from '../Components-Jobseeker/FHeader'

// Assets import (kept same)
import blogheadimg from "../assets/Blog_Images/bloghead.png";
import blogimg from "../assets/Blog_Images/blog1.png";
import bloggimg from "../assets/Blog_Images/blog2.png";
import blggimg from "../assets/Blog_Images/blog3.png";
import blogcimg from "../assets/Blog_Images/blog4.png";
import bloggcimg from "../assets/Blog_Images/blog5.png";
import blogccimg from "../assets/Blog_Images/blog6.png";
import bloggccimg from "../assets/Blog_Images/blog7.png";
import blggcimg from "../assets/Blog_Images/blog8.png";
import blogimgg from "../assets/Blog_Images/blog9.png";
import bloggimgg from "../assets/Blog_Images/blog10.png";
import blooggimgg from "../assets/Blog_Images/blog11.png";

export const BlogPage = () => {
  const navigate = useNavigate();

  // 1. Data arrays to avoid repetition
  const featuredBlogs = [
  ];

  const categories = [
    { img: blogcimg, title: "career" },
    { img: bloggcimg, title: "Onboarding" },
    { img: blogccimg, title: "tasks" },
    { img: bloggccimg, title: "Worktype" },
    { img: blggcimg, title: "Meetings" },
    { img: blogimgg, title: "Environment" },
  ];

  const techBlogs = [
    { img: blooggimgg, title: "Hook readers instantly: Start with a bold stat, question, or story" },
    { img: blggimg, title: "Hook readers instantly: Start with a bold stat, question, or story" },
  ];

  // 2. Reusable Card Component
  const BlogCard = ({ img, title, desc, isCategory = false }) => (
    <div className='content'>
      <img src={img} alt="blog" width="300" />
      <h3 className={isCategory ? 'card-title' : ''}>{title}</h3>
      <p>{desc || "Hook readers instantly: Start with a bold stat, question, or story"}</p>
      <button>Read more</button>
    </div>
  );

  return (
    <>
      <FHeader />

      <div style={{ marginTop: "150px" }} className='blogpage'>
        <img src={blogheadimg} alt="blogpage" width="1450px" style={{ padding: "25px" }} />
      </div>

      {/* Featured Section */}
      <div className='cat-con'>
        <div className='container2'>
          {featuredBlogs.map((blog, index) => (
            <BlogCard key={index} {...blog} />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className='cat-con'>
        <div className='categories2'>
          <h1>Categories</h1>
          <button onClick={() => navigate('/Job-portal/jobseeker/Blogs/Category')} className='blog-view-all'>view all</button>
        </div>
        <div className='container2'>
          {categories.map((cat, index) => (
            <BlogCard key={index} {...cat} isCategory={true} />
          ))}
        </div>
      </div>

      {/* Technology Blogs Section */}
      <div className='cat-con'>
        <div className='categories2'>
          <h1>Technology Blogs</h1>
          <button onClick={() => navigate('/Job-portal/jobseeker/Blogs/Technology')} className='blog-view-all'>view all</button>
        </div>
        <div className='container2'>
          {techBlogs.map((blog, index) => (
            <BlogCard key={index} {...blog} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};