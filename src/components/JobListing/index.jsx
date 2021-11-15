import React from "react";
import "../../css/jobListing.scss";
import Link from "@docusaurus/Link";

const JobListing = ({
  singleListing = false,
  image,
  title,
  company,
  description,
  salary,
  link,
}) => {
  return (
    <div
      className={`job-listing-container ${singleListing && "single-listing"}`}
    >
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
          {singleListing ? (
            <span>{description}</span>
          ) : (
            <>
              <span>{description.slice(0, 220)}...</span>
              <Link
                to={`job-listings/${company.toLowerCase()}/${title
                  .toLowerCase()
                  .split(" ")
                  .join("-")}`}
              >
                see more
              </Link>
            </>
          )}
        </div>
        {singleListing && (
          <div className="job-link">
            <br />
            <a href={link} target="_blank" rel="noopener noreferrer">
              Go to the job post
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;
