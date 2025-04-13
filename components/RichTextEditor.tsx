import { Text } from "react-native"
import React from "react"
import styled from "styled-components/native"
import { 
  RichEditor, 
  RichToolbar, 
  actions,
  RichEditorProps,
  RichToolbarProps 
} from "react-native-pell-rich-editor"
import { useTranslation } from 'react-i18next'
import { theme } from "../constants/theme"

// Definiamo il tipo per le azioni della toolbar
type ToolbarAction = typeof actions[keyof typeof actions];

interface RichTextEditorProps {
  editorRef: React.RefObject<RichEditor>
  onChange: (text: string) => void
  initialContent?: string
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  customActions?: ToolbarAction[]
  toolbarProps?: Partial<RichToolbarProps<any>>
  editorProps?: Partial<RichEditorProps>
}

const EditorContainer = styled.View<{ minHeight?: number }>`
  min-height: ${props => props.minHeight || 285}px;
`

const StyledRichToolbar = styled(RichToolbar)`
  border-top-right-radius: ${theme.radius.xl}px;
  border-top-left-radius: ${theme.radius.xl}px;
  background-color: ${theme.colors.gray};
`

const StyledRichEditor = styled(RichEditor)`
  min-height: 240px;
  flex: 1;
  border-width: 1.5px;
  border-top-width: 0;
  border-bottom-left-radius: ${theme.radius.xl}px;
  border-bottom-right-radius: ${theme.radius.xl}px;
  border-color: ${theme.colors.gray};
  padding: 5px;
`

const defaultActions: ToolbarAction[] = [
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
]

const defaultIconMap = {
  [actions.heading1]: ({ tintColor }: { tintColor: string }) => (
    <Text style={{ color: tintColor }}>H1</Text>
  ),
  [actions.heading4]: ({ tintColor }: { tintColor: string }) => (
    <Text style={{ color: tintColor }}>H4</Text>
  ),
}

const editorStyleProp = {
  color: theme.colors.textDark,
  placeholderColor: "gray",
}

const flatContainerStyleProp = {
  paddingHorizontal: 8,
  gap: 3,
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  editorRef,
  onChange,
  initialContent = "",
  placeholder,
  minHeight,
  disabled = false,
  customActions,
  toolbarProps = {},
  editorProps = {}
}) => {
  const { t } = useTranslation()

  React.useEffect(() => {
    if (initialContent && editorRef.current) {
      editorRef.current.setContentHTML(initialContent)
    }
  }, [initialContent])

  return (
    <EditorContainer minHeight={minHeight}>
      <StyledRichToolbar
        actions={customActions || defaultActions}
        iconMap={defaultIconMap}
        flatContainerStyle={flatContainerStyleProp}
        selectedIconTint={theme.colors.primaryDark}
        editor={editorRef}
        disabled={disabled}
        {...toolbarProps}
      />

      <StyledRichEditor
        ref={editorRef}
        editorStyle={editorStyleProp}
        placeholder={placeholder || t('whatsOnYourMind')}
        onChange={onChange}
        disabled={disabled}
        {...editorProps}
      />
    </EditorContainer>
  )
}

export default RichTextEditor

