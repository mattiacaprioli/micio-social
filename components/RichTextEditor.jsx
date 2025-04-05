import { Text, View } from "react-native"; 
import React from "react";
import styled from "styled-components/native"; 
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { theme } from "../constants/theme";

// Styled Components
const EditorContainer = styled.View`
  min-height: 285px;
`;

// Note: Styling complex third-party components might require passing style objects as props
// instead of relying solely on styled() wrapping if direct styling doesn't work.
const StyledRichToolbar = styled(RichToolbar)`
  border-top-right-radius: ${theme.radius.xl}px;
  border-top-left-radius: ${theme.radius.xl}px;
  background-color: ${theme.colors.gray};
`;

const StyledRichEditor = styled(RichEditor)`
  /* containerStyle equivalent */
  min-height: 240px;
  flex: 1;
  border-width: 1.5px;
  border-top-width: 0;
  border-bottom-left-radius: ${theme.radius.xl}px;
  border-bottom-right-radius: ${theme.radius.xl}px;
  border-color: ${theme.colors.gray};
  padding: 5px;
`;

// Style objects to be passed as props, as direct styling might not work for these
const editorStyleProp = {
  color: theme.colors.textDark,
  placeholderColor: "gray",
};

const flatContainerStyleProp = {
  paddingHorizontal: 8,
  gap: 3,
};


const RichTextEditor = ({ editorRef, onChange }) => {
  return (
    <EditorContainer>
      <StyledRichToolbar
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading4,
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>H1</Text>
          ),
          [actions.heading4]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>H4</Text>
          ),
        }}
        // Pass flatContainerStyle as a prop
        flatContainerStyle={flatContainerStyleProp}
        selectedIconTint={theme.colors.primaryDark}
        editor={editorRef}
        disabled={false}
      />

      <StyledRichEditor
        ref={editorRef}
        // Pass editorStyle as a prop
        editorStyle={editorStyleProp}
        placeholder={"What's on your mind?"}
        onChange={onChange}
      />
    </EditorContainer>
  );
};

export default RichTextEditor;

