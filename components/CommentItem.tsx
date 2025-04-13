import { Text, View, TouchableOpacity, Alert } from "react-native"
import React from "react"
import styled, { css } from "styled-components/native"
import { theme } from "../constants/theme"
import { hp } from "../helpers/common"
import Avatar from "./Avatar"
import moment from "moment"
import Icon from "../assets/icons"
import { Comment } from "@/src/types"

interface CommentItemProps {
  item: Comment;
  canDelete?: boolean;
  onDelete?: (comment: Comment) => void;
  highlight?: boolean;
}

interface ContentProps {
  highlight: boolean;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  flex-direction: row;
  gap: 7px;
`

const Content = styled.View<ContentProps>`
  background-color: rgba(0,0,0,0.06);
  flex: 1;
  gap: 5px;
  padding: 10px 14px;
  border-radius: ${theme.radius.md}px;

  ${(props) =>
    props.highlight &&
    css`
      border-width: 0.2px;
      background-color: white;
      border-color: ${theme.colors.dark};
      shadow-color: ${theme.colors.dark};
      shadow-offset: 0px 0px;
      shadow-opacity: 0.3;
      shadow-radius: 8px;
      elevation: 5;
    `}
`

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const NameContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`

const StyledText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: ${theme.fonts.medium};
  color: ${theme.colors.textDark};
`

const DateText = styled(StyledText)`
  color: ${theme.colors.textLight};
`

const CommentText = styled(StyledText)`
  font-weight: normal;
`

const CommentItem: React.FC<CommentItemProps> = ({
  item,
  canDelete = false,
  onDelete = () => {},
  highlight = false,
}) => {
  const created_at = moment(item?.created_at).format("MMM d")

  const handleDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to do this?", [
      {
        text: "Cancel",
        onPress: () => console.log("Modal cancelled"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ])
  }

  return (
    <Container>
      <Avatar uri={item?.user?.image} />
      <Content highlight={highlight}>
        <HeaderRow>
          <NameContainer>
            <StyledText>{item?.user?.name}</StyledText>
            <StyledText>•</StyledText>
            <DateText>{created_at}</DateText>
          </NameContainer>
          {canDelete && (
            <TouchableOpacity onPress={handleDelete}>
              <Icon name="delete" size={20} color={theme.colors.rose} />
            </TouchableOpacity>
          )}
        </HeaderRow>
        <CommentText>{item?.text}</CommentText>
      </Content>
    </Container>
  )
}

export default CommentItem