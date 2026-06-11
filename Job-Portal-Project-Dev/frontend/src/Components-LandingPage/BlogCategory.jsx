import React from 'react';
import blogcimg from "../assets/Blog_Images/blog4.png";
import bloggcimg from "../assets/Blog_Images/blog5.png";
import blogccimg from "../assets/Blog_Images/blog6.png";
import bloggccimg from "../assets/Blog_Images/blog7.png";
import blggcimg from "../assets/Blog_Images/blog8.png";
import tat from "../assets/Blog_Images/TAT.png";
import Discussion from "../assets/Blog_Images/DiscussionBlog.png";
import Growth from "../assets/Blog_Images/GrowthBlog.png";
import Learning from "../assets/Blog_Images/LearningBlog.png";
import Planning from "../assets/Blog_Images/Planning.png";
import SuccessBlog from "../assets/Blog_Images/SuccessBlog.png";
import { Header } from '../Components-LandingPage/Header';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from '../Components-Jobseeker/FHeader'

export const BlogCategory = () => {
  const navigate = useNavigate()
  return (
    <>
    <FHeader/>
      
      <div style={{margin:"120px 45px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)", borderRadius:"15px"}} className='search-backbtn-container'>
          <button style={{marginLeft:"15px"}}  className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <div style={{width:"80%", textAlign:"center",marginLeft:"80px"}} ><h1 className="main-title">Categories</h1></div>
        </div>
        <div className='cat-con'>
          <div className='container2'>
          <div className='content'>
          <img src={blogcimg} alt="blog" width="300"/>
          <h3 className='card-title'>career</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
        
          <div className='content'>
          <img src={bloggcimg} alt="blog" width="300"/> 
          <h3 className='card-title'>Onboarding</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
        
          <div className='content' >
          <img src={blogccimg} alt="blog" width="300"/>
          <h3 className='card-title'>tasks</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
        
          <div className='content'>
          <img src={bloggccimg} alt="blog" width="300"/> 
          <h3 className='card-title'>Worktype</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
        
          <div className='content'>
          <img src={blggcimg} alt="blog" width="300"/>
          <h3 className='card-title'>Meetings</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
        
          <div className='content'>
          <img src={blogccimg} alt="blog" width="300"/>
          <h3 className='card-title'>Environment</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={tat} alt="blog" width="300"/> 
          <h3 className='card-title'>TAT</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={Planning} alt="blog" width="300"/> 
          <h3 className='card-title'>Planning</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={SuccessBlog} alt="blog" width="300"/> 
          <h3 className='card-title'>Success</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={Learning} alt="blog" width="300"/> 
          <h3 className='card-title'>Learning</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={Growth} alt="blog" width="300"/> 
          <h3 className='card-title'>Growth</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          <div className='content'>
          <img src={Discussion} alt="blog" width="300"/> 
          <h3 className='card-title'>Discussion</h3>
          <p>Hook readers instantly: Start with a bold stat, question, or story</p>
          <button>Read more</button>
         <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          <p className="extra-content">Hook readers instantly: Start with a bold stat, question, or story</p>
          </div>
          </div>
          </div>
          
        <Footer/>
   </>
  );
};

 