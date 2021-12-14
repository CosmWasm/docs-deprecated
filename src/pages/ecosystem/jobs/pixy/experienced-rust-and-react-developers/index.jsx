import React from "react";
import Layout from "@theme/Layout";
import "../../../../../css/jobListing.scss";
import JOBS from "../../../../../../static/job-listings.json";
import JobListing from "../../../../../components/JobListing";

const JOB = JOBS[6];

const Description = () => {
  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <JobListing
          image={JOB.logo}
          title={JOB.title}
          description={JOB.description.map((line) => {
            return (
              <>
                <span>{line}</span>
                <br />
              </>
            );
          })}
          company={JOB.company}
          salary={JOB.salary}
          link={JOB.link}
          singleListing
        />
      </div>
    </Layout>
  );
};

export default Description;
