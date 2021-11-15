import React from "react";
import Layout from "@theme/Layout";
import JobListing from "../components/JobListing";

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
          title="Senior Go Developer"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum."
          company="Confio"
          salary="60000-80000 EUR"
        />
        <JobListing
          image="https://i.kym-cdn.com/photos/images/newsfeed/001/431/201/40f.png"
          title="Senior Go Developer"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum."
          company="Confio"
          salary="60000-80000 EUR"
        />
      </div>
    </Layout>
  );
}

export default Listings;
