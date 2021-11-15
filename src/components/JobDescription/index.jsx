import React from "react";
import "../../css/jobListing.scss";

const JobListing = ({ image, title, company, description, salary, link }) => {
  return (
    <div className="job-listing-container job-description-container">
      <div className="job-image">
        <img src={image} alt="job image" />
      </div>
      <div className="job-content">
        <div className="company">
          <span className="bold">Company: </span>
          <span>{company}</span>
        </div>
        <div className="title">
          <span className="bold">Title: </span>
          <span>{title}</span>
        </div>
        <div className="salary">
          <span className="bold">Salary: </span>
          <span>{salary}</span>
        </div>
        <div className="description">
          <span className="bold">Description: </span>
          <br />
          <span>{description}</span>
        </div>
        <br />
        <div className="job-link">
          <a href={link} target="_blank" rel="noopener noreferrer">Go to the job post</a>
        </div>
      </div>
    </div>
  );
};

export default JobListing;
