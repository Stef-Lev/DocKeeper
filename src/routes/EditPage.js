import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styled from "styled-components";
import { Paper } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { theme } from "../themeColors";
import Loader from "../components/Loader";
import GenericModal from "../components/GenericModal";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ActionButton from "../components/ActionButton";
import ActionButtonsContainer from "../components/ActionButtonsContainer";

const Container = styled.div`
  padding: 16px;

  .rich-toolbar {
    border: 1px solid rgba(0, 0, 0, 0.2);
    position: sticky;
    top: 0;
    z-index: 1001;
  }
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
    padding: 20px;
  }
`;

// @TODO MODAL NOT SAVED

function EditPage() {
  const { id } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      setLoading(true);

      if (id) {
        const DOC_URL = `http://localhost:3002/tutorials/${id}`;

        fetch(DOC_URL)
          .then((res) => res.json())
          .then((result) => {
            setEditorState(
              EditorState.createWithContent(convertFromRaw(result.content))
            );
          })
          .catch(console.log("Error"))
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (editorState) => {
    setEditorState(editorState);
  };

  const deleteCurrent = () => {
    history.push("/");
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    if (id) {
      fetch(`http://localhost:3002/tutorials/${id}`, {
        method: "PUT",
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
        })
        .finally(() => {
          setModalOpen(true);
        });
    } else {
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
        })
        .finally(() => {
          setModalOpen(true);
        });
    }
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: "32px" }}>
        {loading && <Loader />}
        {!loading && (
          <>
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
          </>
        )}
        <GenericModal
          shouldOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            history.push(`/`);
          }}
          type="saveSuccess"
        />
        <ActionButtonsContainer position="left">
          <ActionButton
            onClick={() => history.push("/")}
            color={theme.actionButton.color}
            backgroundColor={theme.actionButton.background}
            hoverColor={theme.actionButton.hovered}
            icon={<ArrowBackIcon style={{ width: "50px", height: "50px" }} />}
          />
        </ActionButtonsContainer>
        <ActionButtonsContainer position="right">
          <ActionButton
            onClick={handleSave}
            color={theme.actionButton.color}
            backgroundColor={theme.actionButton.background}
            hoverColor={theme.actionButton.hovered}
            icon={<SaveIcon style={{ width: "50px", height: "50px" }} />}
          />
          {id && (
            <ActionButton
              onClick={deleteCurrent}
              color={theme.deleteButton.color}
              backgroundColor={theme.deleteButton.background}
              hoverColor={theme.deleteButton.hovered}
              icon={<DeleteIcon style={{ width: "50px", height: "50px" }} />}
            />
          )}
        </ActionButtonsContainer>
      </Paper>
    </Container>
  );
}

export default EditPage;
