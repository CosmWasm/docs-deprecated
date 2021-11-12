import React, { useState } from "react";
import "../../css/jobListing.scss";

const JobListing = ({ image, title, company, description, salary }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className="job-listing-container">
      <div className="job-image">
        <img src={image} alt="job image" />
      </div>
      <div className="job-content">
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
          <span>{description.slice(0, 36)}...</span>
          <span className="expand">{opened ? "see less" : "see more"}</span>
        </div>
      </div>
    </div>
  );
};

export default JobListing;
