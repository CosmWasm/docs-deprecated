import React from "react";
import Layout from "@theme/Layout";
import "../../../../css/jobListing.scss";
import JOBS from "../../../../../static/job-listings.json";
import JobDescription from "../../../../components/JobDescription";

const JOB = JOBS[0];

const Description = () => {
  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <JobDescription
          image="https://i.kym-cdn.com/photos/images/newsfeed/001/431/201/40f.png"
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
        />
      </div>
    </Layout>
  );
};

export default Description;
