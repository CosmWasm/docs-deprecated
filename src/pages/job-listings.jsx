import React from "react";
import Layout from "@theme/Layout";
import JobListing from "../components/JobListing";
import JOBS from '../../static/job-listings.json'

function Listings() {
  return (
    <Layout title="Job Listings">
      <div
        style={{
          width: "100%",
          flexWrap: "wrap",
          display: "flex",
          padding: "20px",
        }}
      >
        <JobListing
          image="https://i.kym-cdn.com/photos/images/newsfeed/001/431/201/40f.png"
          title={JOBS[0].title}
          description={JOBS[0].description[0] + JOBS[0].description[1]}
          company={JOBS[0].company}
          salary={JOBS[0].salary}
        />
        <JobListing
          image="https://i.kym-cdn.com/photos/images/newsfeed/001/431/201/40f.png"
          title={JOBS[1].title}
          description={JOBS[1].description[0] + JOBS[1].description[1]}
          company={JOBS[1].company}
          salary={JOBS[1].salary}
        />
      </div>
    </Layout>
  );
}

export default Listings;
