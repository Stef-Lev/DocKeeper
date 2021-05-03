import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";
import { convertToHTML } from "draft-convert";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import DOMPurify from "dompurify";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styled from "styled-components";
import { Button, Paper } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { theme } from "../themeColors";

const Container = styled.div`
  padding: 16px;

  .rich-wrapper {
    margin: 22px auto;
  }
  .rich-wrapper div {
    border-radius: 8px;
  }
  .rdw-option-active {
    background-color: rgba(0, 0, 0, 0.2);
  }
  .rich-editor {
    border: 1px solid rgba(0, 0, 0, 0.2);
    background-color: #f1f1f1;
    border-radius: 8px;
    margin: 22px auto;
    padding: 5px 10px;
  }
`;

const SaveButton = styled(Button)`
  background-color: ${theme.saveButton.background};
  color: ${theme.saveButton.color};
  :hover {
    background-color: ${theme.saveButton.hovered};
  }
  transition: all 250ms linear;
`;

// @TODO MODAL NOT SAVED
const CancelButton = styled(Button)`
  background-color: ${theme.cancelButton.background};
  color: ${theme.cancelButton.color};
  margin-right: 16px;
  :hover {
    background-color: ${theme.cancelButton.hovered};
  }
  transition: all 250ms linear;
`;

function EditPage() {
  // @TODO if ID edit else new
  const { id } = useParams();
  const history = useHistory();

  const [convertedContent, setConvertedContent] = useState(null);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleChange = (editorState) => {
    setEditorState(editorState);
    convertContentToHTML();
  };

  const convertContentToHTML = () => {
    let currentContentAsHTML = convertToHTML(editorState.getCurrentContent());
    setConvertedContent(currentContentAsHTML);
    console.log(currentContentAsHTML);
  };

  const createMarkup = (html) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };

  const cancelAndReturn = () => {
    history.push("/");
  };

  // @TODO refactor this
  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);

    fetch("http://localhost:3002/tutorials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: raw, createdAt: new Date() }, null, 2),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // IMG URL
  // https://images.unsplash.com/photo-1619694810130-50021400dbb1?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80

  return (
    <Container>
      <Paper elevation={3} style={{ padding: "32px" }}>
        <Typography variant="h2" style={{ fontSize: "2.2rem" }}>
          Docs
        </Typography>
        <Editor
          editorState={editorState}
          toolbarClassName="rich-toolbar"
          wrapperClassName="rich-wrapper"
          editorClassName="rich-editor"
          onEditorStateChange={handleChange}
        />

        <div
          style={{ backgroundColor: "black", color: "white" }}
          dangerouslySetInnerHTML={createMarkup(convertedContent)}
        ></div>
        <CancelButton variant="contained" onClick={cancelAndReturn}>
          Cancel
        </CancelButton>
        <SaveButton variant="contained" onClick={handleSave}>
          Save
        </SaveButton>
      </Paper>
    </Container>
  );
}

export default EditPage;
