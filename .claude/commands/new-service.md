Create a new Supabase service file in `services/` following the project conventions.

Before writing any code, ask me:
1. The domain name (e.g. "product", "review", "event") — file will be named `{domain}Service.ts`
2. Which operations are needed (e.g. "fetch all, fetch by id, create, update, delete")
3. The Supabase table name(s) involved
4. The main data type/shape (columns I care about)

Then generate `services/{domain}Service.ts` following these rules exactly:

- Import `supabase` from `@/lib/supabase`
- Import `ApiResponse` from `./types`
- Every function must be `async` and return `Promise<ApiResponse<T>>`
- Every function must have a `try/catch` block
- Inside try: check `if (error)` after every Supabase call → return `{ success: false, msg: error.message }`
- On success: return `{ success: true, data }`
- In catch: return `{ success: false, msg: (error as Error).message }`
- Never throw — always return `{ success: false }`
- Use `.select().single()` for single-row operations
- Use upsert for create-or-update operations

Template to follow:

```typescript
import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./types";

export const fetchAll = async (): Promise<ApiResponse<Row[]>> => {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, msg: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export const fetchById = async (id: string): Promise<ApiResponse<Row>> => {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, msg: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export const createOrUpdate = async (item: Partial<Row>): Promise<ApiResponse<Row>> => {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .upsert(item)
      .select()
      .single();

    if (error) return { success: false, msg: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export const remove = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from("table_name")
      .delete()
      .eq("id", id);

    if (error) return { success: false, msg: error.message };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};
```
