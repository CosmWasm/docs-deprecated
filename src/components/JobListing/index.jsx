import React from "react";
import "../../css/jobListing.scss";
import Link from '@docusaurus/Link'

const JobListing = ({ image, title, company, description, salary }) => {
  return (
    <div className="job-listing-container">
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
          <span>{description.slice(0, 220)}...</span>
          <Link to={`job-listing/${company.toLowerCase()}/${title.toLowerCase().split(' ').join('-')}`}>see more</Link>
        </div>
      </div>
    </div>
  );
};

export default JobListing;
