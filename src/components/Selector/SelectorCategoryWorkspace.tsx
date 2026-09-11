import { useQuery } from "react-query";
import { workspaceAPI } from "../../apis/workspace.api";
import { useMemo } from "react";
import { Form, Select } from "antd";
import type { Rule } from "antd/es/form";

interface Props {
  workspaceId: string;
  visible: boolean;
}

const rules: Rule[] = [{ required: true }];

export default function SelectorCategoryWorkspace({ workspaceId, visible }: Props) {
  const { data: workspaceDetail } = useQuery({
    queryKey: ["workspace-categories", workspaceId],
    queryFn: () => workspaceAPI.getWorkspaceById(workspaceId),
    enabled: visible && !!workspaceId,
    staleTime: 1000 * 60 * 15,
  });

  const categories = useMemo(() => workspaceDetail?.data.data.workspace.categories ?? [], [workspaceDetail]);

  return (
    <Form.Item label="Chủ đề" name="categoryId" rules={rules} style={{ width: "100%" }}>
      <Select
        placeholder="Chọn chủ đề"
        style={{ width: "100%" }}
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
      />
    </Form.Item>
  );
}
