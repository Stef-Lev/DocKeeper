import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Button } from "@material-ui/core";
import styled from "styled-components";
import DocItem from "../components/DocItem";
import SearchBox from "../components/SearchBox";
import Loader from "../components/Loader";
import ActionButton from "../components/ActionButton";
import { useHistory } from "react-router-dom";

const DATA_URL = "http://localhost:3002/tutorials";

const Container = styled.div`
  margin-top: 16px;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 16px;
`;

// Fetch title
// Object.values(data._immutable.currentContent.blockMap).find(el => el.type === 'header-one').text

function BasicPage() {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      setLoading(true);

      fetch(DATA_URL)
        .then((res) => res.json())
        .then((result) => {
          mounted && setData(result);
        })
        .catch(console.log("Error"))
        .finally(() => {
          mounted && setLoading(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, []);

  console.log(data);
  return (
    <Paper>
      <Container>
        <Typography variant="h1" style={{ fontSize: "2.5rem" }}>
          Document Keeper
        </Typography>
        <Typography variant="h2" style={{ fontSize: "2.2rem" }}>
          Docs
        </Typography>
        <SearchBox
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        {loading && <Loader />}
        {!loading &&
          data
            .filter((doc) =>
              doc.content.blocks
                .find((item) => item.type === "header-one")
                .text.toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((doc) => (
              <DocItem
                key={`document_ID${doc.id}`}
                title={
                  doc.content.blocks.find((item) => item.type === "header-one")
                    .text
                }
                id={doc.id}
                preview="Author"
              />
            ))}
        <ActionButton type="add" onClick={() => history.push(`/edit`)} />
      </Container>
    </Paper>
  );
}

export default BasicPage;
