import React from "react";
import { ScrollView } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { ProductCategory } from "../../services/types";
import Icon from "../../assets/icons";

interface CategoryFilterProps {
  categories: ProductCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const Container = styled.View`
  margin-vertical: 16px;
`;

const CategoryScroll = styled.ScrollView`
  padding-horizontal: 16px;
`;

const CategoryItem = styled.TouchableOpacity<{ isSelected: boolean }>`
  background-color: ${(props) => 
    props.isSelected 
      ? props.theme.colors.primary 
      : props.theme.colors.card
  };
  padding: 6px 8px;
  border-radius: 10px;
  margin-right: 12px;
  flex-direction: row;
  align-items: center;
`;

const CategoryText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => 
    props.isSelected 
      ? 'white' 
      : props.theme.colors.text
  };
  margin-left: 6px;
`;

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const theme = useStyledTheme();
  const getCategoryIcon = (categoryId: string) => {
    const iconMap = {
      'all': 'grid',
      'food': 'coffee',
      'toys': 'smile',
      'accessories': 'package',
      'health': 'heart',
      'grooming': 'scissors',
      'other': 'moreHorizontal'
    };
    return iconMap[categoryId as keyof typeof iconMap] || 'package';
  };

  const getCategoryLabel = (categoryId: string) => {
    const labelMap = {
      'all': 'Tutti',
      'food': 'Cibo',
      'toys': 'Giochi',
      'accessories': 'Accessori',
      'health': 'Salute',
      'grooming': 'Cura',
      'other': 'Altro'
    };
    return labelMap[categoryId as keyof typeof labelMap] || categoryId;
  };

  const getIconColor = (isSelected: boolean) => {
    if (isSelected) {
      return 'white';
    }
    return theme.colors.text;
  };

  const allCategories = [
    { id: 'all', name: 'Tutti', icon: 'grid' },
    ...categories
  ];

  return (
    <Container>
      <CategoryScroll
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {allCategories.map((category) => (
          <CategoryItem
            key={category.id}
            isSelected={selectedCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
          >
            <Icon
              name={getCategoryIcon(category.id)}
              size={16}
              color={getIconColor(selectedCategory === category.id)}
            />
            <CategoryText isSelected={selectedCategory === category.id}>
              {getCategoryLabel(category.id)}
            </CategoryText>
          </CategoryItem>
        ))}
      </CategoryScroll>
    </Container>
  );
};

export default CategoryFilter;