"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Minus } from "lucide-react";

// -------------------- Types --------------------
interface Node {
  id: string;
  label: string;
  children: Node[];
  parentId: string | null;
  type: "director" | "subordinate" | "branch";
}

// -------------------- Helpers --------------------
const generateId = () => Math.random().toString(36).substring(2, 9);

const buildLabelPath = (nodes: Node[], parentId: string | null, index: number): string => {
  if (!parentId) return ""; // Director
  const parent = findNodeById(nodes, parentId);
  return parent ? `${parent.label}/${index}` : `${index}`;
};

const findNodeById = (nodes: Node[], id: string): Node | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
};

// -------------------- Node Component --------------------
const NodeComponent = ({
  node,
  onAddBranchMember,
  onAddSubordinate,
  onRemove,
}: {
  node: Node;
  onAddBranchMember: (id: string) => void;
  onAddSubordinate: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="border p-2 m-2 rounded bg-white shadow">
      <div className="flex justify-between items-center">
        <span className={node.type === "subordinate" ? "font-semibold" : ""}>
          {node.label}
        </span>
        <div className="flex gap-1">
          {node.type !== "director" && (
            <Button variant="outline" size="icon" onClick={() => onAddBranchMember(node.id)}>
              <Plus className="w-4 h-4 text-green-600" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => onAddSubordinate(node.id)}>
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </Button>
          {node.type !== "director" && (
            <Button variant="outline" size="icon" onClick={() => onRemove(node.id)}>
              <Minus className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Render Children */}
      <div className="ml-4 border-l border-gray-300 pl-2">
        {node.children.map((child) => (
          <NodeComponent
            key={child.id}
            node={child}
            onAddBranchMember={onAddBranchMember}
            onAddSubordinate={onAddSubordinate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

// -------------------- Org Chart Root --------------------
const OrgChart = () => {
  const [tree, setTree] = useState<Node[]>([
    {
      id: "director",
      label: "Director",
      parentId: null,
      type: "director",
      children: [],
    },
  ]);

  // Add a new subordinate branch (child)
  const addSubordinate = (parentId: string) => {
    const newNodeId = generateId();

    const updateTree = (nodes: Node[]): Node[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          const count = node.children.length + 1;
          const label = buildLabelPath(tree, parentId, count);

          return {
            ...node,
            children: [
              ...node.children,
              {
                id: newNodeId,
                label: node.type === "director" ? `Subordinate ${count}` : `${label}`,
                parentId,
                type: "subordinate",
                children: [],
              },
            ],
          };
        }
        return { ...node, children: updateTree(node.children) };
      });

    setTree(updateTree(tree));
  };

  // Add a branch member (peer under same parent)
  const addBranchMember = (targetId: string) => {
    const findParentId = (nodes: Node[], id: string): string | null => {
      for (const node of nodes) {
        if (node.children.some((child) => child.id === id)) return node.id;
        const result = findParentId(node.children, id);
        if (result) return result;
      }
      return null;
    };

    const parentId = findParentId(tree, targetId);
    if (!parentId) return;

    const parentNode = findNodeById(tree, parentId);
    if (!parentNode) return;

    const count = parentNode.children.length + 1;
    const newNodeId = generateId();
    const newLabel = buildLabelPath(tree, parentId, count);

    const updateTree = (nodes: Node[]): Node[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...node.children,
              {
                id: newNodeId,
                label: newLabel,
                parentId,
                type: "branch",
                children: [],
              },
            ],
          };
        }
        return { ...node, children: updateTree(node.children) };
      });

    setTree(updateTree(tree));
  };

  // Remove any node
  const removeNode = (id: string) => {
    const deleteNode = (nodes: Node[]): Node[] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: deleteNode(node.children),
        }));

    setTree(deleteNode(tree));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center mb-4">Organizational Structure</h2>
      <div className="flex justify-center">
        {tree.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            onAddBranchMember={addBranchMember}
            onAddSubordinate={addSubordinate}
            onRemove={removeNode}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;

// "use client"

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Minus } from "lucide-react";

// interface Node {
//   id: string;
//   label: string;
//   children: Node[];
// }

// const generateId = () => Math.random().toString(36).substring(2, 9);

// const NodeComponent = ({ node, onAdd, onRemove }: { node: Node; onAdd: (id: string) => void; onRemove: (id: string) => void }) => {
//   return (
//     <div className="border p-2 m-2 rounded bg-white shadow">
//       <div className="flex justify-between items-center">
//         <span>{node.label}</span>
//         <div className="flex gap-2">
//           <Button variant="outline" size="icon" onClick={() => onAdd(node.id)}>
//             <Plus className="w-4 h-4 text-white bg-green-600" />
//           </Button>
//           <Button variant="outline" size="icon" onClick={() => onRemove(node.id)}>
//             <Minus className="w-4 h-4 text-white bg-red-600" />
//           </Button>
//         </div>
//       </div>
//       <div className="ml-4 border-l border-gray-300 pl-2">
//         {node.children.map((child) => (
//           <NodeComponent key={child.id} node={child} onAdd={onAdd} onRemove={onRemove} />
//         ))}
//       </div>
//     </div>
//   );
// };

// const OrgChart = () => {
//   const [tree, setTree] = useState<Node[]>([]);

//   const handleAdd = (id: string | null = null) => {
//     const newNode: Node = {
//       id: generateId(),
//       label: id ? `Branch Member ${id}/${Math.floor(Math.random() * 10)}` : `Subordinate ${tree.length + 1}`,
//       children: [],
//     };

//     if (!id) return setTree([...tree, newNode]);

//     const updateTree = (nodes: Node[]): Node[] =>
//       nodes.map((node) => {
//         if (node.id === id) {
//           return { ...node, children: [...node.children, newNode] };
//         }
//         return { ...node, children: updateTree(node.children) };
//       });

//     setTree(updateTree(tree));
//   };

//   const handleRemove = (id: string) => {
//     const removeNode = (nodes: Node[]): Node[] =>
//       nodes
//         .filter((node) => node.id !== id)
//         .map((node) => ({ ...node, children: removeNode(node.children) }));
//     setTree(removeNode(tree));
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold text-center mb-4">Organizational Structure</h2>
//       <div className="flex justify-center mb-4">
//         <Button onClick={() => handleAdd(null)}>Director ...</Button>
//       </div>
//       <div className="p-4">
//         {tree.map((node) => (
//           <NodeComponent key={node.id} node={node} onAdd={handleAdd} onRemove={handleRemove} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OrgChart;
