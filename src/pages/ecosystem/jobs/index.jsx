import React from "react";
import Layout from "@theme/Layout";
import JobListing from "../../../components/JobListing";
import JOBS from "../../../../static/job-listings.json";

const Listings = () => {
  return (
    <Layout title="Jobs">
      <div
        style={{
          width: "100%",
          flexWrap: "wrap",
          display: "flex",
          padding: "20px",
        }}
      >
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
    </Layout>
  );
};

export default Listings;