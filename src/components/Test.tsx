"use client";

import React, { useState } from "react";

type NodeType = "Subordinate" | "BranchMember" | "Director";

interface OrgNode {
  id: number;
  type: NodeType;
  label: string;
  children: OrgNode[];
}

let idCounter = 1;

const createNode = (type: NodeType, label: string): OrgNode => ({
  id: idCounter++,
  type,
  label,
  children: [],
});

const OrgNodeComponent: React.FC<{
  node: OrgNode;
  onAdd: (parentId: number, path: string, type: NodeType) => void;
  onRemove: (id: number) => void;
  path: string;
}> = ({ node, onAdd, onRemove, path }) => {
  const canAdd =
    node.type === "Subordinate" ||
    (node.type === "BranchMember" && node.children.length === 0);

  return (
    <div style={{ marginLeft: 20, marginTop: 10, border: "1px solid #ccc", padding: 10, borderRadius: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <strong>{node.type} {node.label}</strong>
        {canAdd && (
          <button
            onClick={() =>
              onAdd(
                node.id,
                path,
                node.type === "Subordinate" ? "BranchMember" : "Subordinate"
              )
            }
            style={{ color: "green" }}
          >
            addd
          </button>
        )}
        {node.type !== "Director" && (
          <button onClick={() => onRemove(node.id)} style={{ color: "red" }}>
            cancle
          </button>
        )}
      </div>

      <div>
        {node.children.map((child, index) => {
          const childPath =
            node.type === "Subordinate"
              ? `${path}/${index + 1}`
              : path;
          return (
            <OrgNodeComponent
              key={child.id}
              node={child}
              onAdd={onAdd}
              onRemove={onRemove}
              path={childPath}
            />
          );
        })}
      </div>
    </div>
  );
};

const Task = () => {
  const [tree, setTree] = useState<OrgNode>({
    id: 0,
    type: "Subordinate",
    label: "1",
    children: [],
  });

  const addNode = (parentId: number, path: string, type: NodeType) => {
    const label = `${path}/${(type === "BranchMember" ? getNextBranchCount(tree, parentId) : "1")}`;
    const newNode = createNode(type, label);

    const updateTree = (node: OrgNode): OrgNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children:
            type === "BranchMember"
              ? [...node.children, newNode]
              : [newNode], // only one subordinate
        };
      }

      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };

    setTree(updateTree(tree));
  };

  const removeNode = (id: number) => {
    const deleteFromTree = (node: OrgNode): OrgNode => {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== id)
          .map(deleteFromTree),
      };
    };
    setTree(deleteFromTree(tree));
  };

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Organizational Structure
      </h1>
      <OrgNodeComponent node={tree} onAdd={addNode} onRemove={removeNode} path={"1"} />
    </main>
  );
};

export default Task;

const getNextBranchCount = (root: OrgNode, parentId: number): number => {
  let count = 1;

  const find = (node: OrgNode): boolean => {
    if (node.id === parentId) {
      count = node.children.length + 1;
      return true;
    }
    return node.children.some(find);
  };

  find(root);
  return count;
};
