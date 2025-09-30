import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import styled, { useTheme } from 'styled-components/native';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons/index';
import { theme as lightTheme } from '../constants/theme';

// Styled Components
const ModalContainer = styled.View`
  flex: 1;
  padding: ${wp(6)}px;
  padding-top: ${hp(2)}px;
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: flex-start;
`;

const BottomContainer = styled.View`
  padding-bottom: ${hp(1)}px;
  padding-top: ${hp(2)}px;
`;

const TitleText = styled.Text`
  font-size: ${hp(2.5)}px;
  font-weight: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${hp(1)}px;
`;

const MessageText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  line-height: ${hp(2.5)}px;
  margin-top: ${hp(2)}px;
`;

const ButtonsContainer = styled.View`
  gap: ${hp(1)}px;
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${hp(1)}px;
  border-radius: ${(props) => props.theme.radius.md}px;
  align-items: center;
`;

const SecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  padding: ${hp(1)}px;
  border-radius: ${(props) => props.theme.radius.md}px;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.gray};
`;

const PrimaryButtonText = styled.Text`
  color: white;
  font-size: ${hp(2)}px;
  font-weight: ${(props) => props.theme.fonts.semibold};
`;

const SecondaryButtonText = styled.Text`
  color: ${(props) => props.theme.colors.text};
  font-size: ${hp(2)}px;
  font-weight: ${(props) => props.theme.fonts.medium};
`;

// Types
type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary';
}

interface CustomModalProps {
  height?: number;
  forceLight?: boolean;
}

export interface CustomModalRef {
  show: (config: {
    type?: ModalType;
    title?: string;
    message: string;
    buttons?: ModalButton[];
    showCloseButton?: boolean;
  }) => void;
  hide: () => void;
}

const PrimaryModal = forwardRef<CustomModalRef, CustomModalProps>(
  ({ height = 300, forceLight = false }, ref) => {
    const rbSheetRef = useRef<any>(null);
    const currentTheme = useTheme();
    const theme = forceLight ? lightTheme : currentTheme;
    const [modalConfig, setModalConfig] = React.useState<{
      type: ModalType;
      title?: string;
      message: string;
      buttons: ModalButton[];
      showCloseButton: boolean;
    }>({
      type: 'info',
      message: '',
      buttons: [],
      showCloseButton: true,
    });

    useImperativeHandle(ref, () => ({
      show: (config) => {
        const defaultButtons: ModalButton[] = [
          {
            text: 'OK',
            onPress: () => rbSheetRef.current?.close(),
            style: 'primary',
          },
        ];

        setModalConfig({
          type: config.type || 'info',
          title: config.title,
          message: config.message,
          buttons: config.buttons || defaultButtons,
          showCloseButton: config.showCloseButton !== false,
        });

        rbSheetRef.current?.open();
      },
      hide: () => {
        rbSheetRef.current?.close();
      },
    }));

    const renderButton = (button: ModalButton, index: number) => {
      const isSecondary = button.style === 'secondary';
      const ButtonComponent = isSecondary ? SecondaryButton : PrimaryButton;
      const TextComponent = isSecondary ? SecondaryButtonText : PrimaryButtonText;

      return (
        <ButtonComponent key={index} onPress={button.onPress}>
          <TextComponent>{button.text}</TextComponent>
        </ButtonComponent>
      );
    };

    return (
      <RBSheet
        ref={rbSheetRef}
        height={height}
        openDuration={250}
        closeDuration={200}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          container: {
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            backgroundColor: theme.colors.background,
          },
          draggableIcon: {
            backgroundColor: theme.colors.gray,
            width: wp(12),
            height: hp(0.5),
          },
        }}
      >
        <ModalContainer>
          {modalConfig.showCloseButton && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: wp(4),
                right: wp(4),
                zIndex: 1,
                padding: wp(2),
              }}
              onPress={() => rbSheetRef.current?.close()}
            >
              <Icon name="x" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}

          <ContentContainer>
            {modalConfig.title && (
              <TitleText>{modalConfig.title}</TitleText>
            )}

            <MessageText>{modalConfig.message}</MessageText>
          </ContentContainer>

          <BottomContainer>
            <ButtonsContainer>
              {modalConfig.buttons.map((button, index) => 
                renderButton(button, index)
              )}
            </ButtonsContainer>
          </BottomContainer>
        </ModalContainer>
      </RBSheet>
    );
  }
);

PrimaryModal.displayName = 'PrimaryModal';

export default PrimaryModal;