import React from "react";
import Layout from "@theme/Layout";
import JobListing from "../../../components/JobListing";
import JOBS from "../../../../static/job-listings.json";
import "../../../css/jobs.scss";

const Listings = () => {
  return (
    <Layout title="Jobs">
      <div className="jobs-container" style={{ padding: "20px" }}>
        <div className="header">
          <h1>Job Listings</h1>
          <span>
            Feel free to join to our{" "}
            <a
              href="https://discord.gg/QBxCCfSxS9"
              target="_blank"
              rel="noopener noreferrer"
            >
              discord server{" "}
            </a>
            to reach about any job opportunities you want to share!
          </span>
        </div>
        <div className="jobs-container">
          {JOBS.map((job, idx) => {
            return (
              <JobListing
                key={idx}
                image="https://i.kym-cdn.com/photos/images/newsfeed/001/431/201/40f.png"
                title={job.title}
                description={job.description[0] + job.description[1]}
                company={job.company}
                salary={job.salary}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Listings;
