Create a new React Native component following the project conventions.

Before writing any code, ask me:
1. The component name (PascalCase)
2. What props it needs (name, type, required/optional)
3. Which folder it belongs to (`components/`, `components/chat/`, `components/pets/`, `components/ecommerce/`, etc.)

Then generate the file at the correct path following these rules exactly:

- Use `styled-components/native` for ALL styling — no StyleSheet, no inline styles
- Use `hp()` / `wp()` from `@/helpers/common` for every size/spacing value — never hardcode px numbers
- Access theme via template literals: `${props => props.theme.colors.XYZ}` and `${props => props.theme.radius.XYZ}`
- Define a TypeScript `interface ComponentNameProps` before the component
- Use `React.FC<ComponentNameProps>` as the component type
- Default export at the bottom

Template to follow:

```typescript
import React from "react";
import styled from "styled-components/native";
import { hp, wp } from "@/helpers/common";

interface ComponentNameProps {
  // props here
}

const Container = styled.View`
  padding: ${wp(4)}px;
  background-color: ${props => props.theme.colors.background};
`;

const ComponentName: React.FC<ComponentNameProps> = ({ /* props */ }) => {
  return (
    <Container>
      {/* content */}
    </Container>
  );
};

export default ComponentName;
```
