"use client";

import React, { useState } from "react";

interface TreeNodeType {
  id: number;
  title: string;
  children: TreeNodeType[];
}

let idCounter = 2;

const TreeNode: React.FC<{
  node: TreeNodeType;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
}> = ({ node, onAdd, onRemove }) => {
  return (
    <div style={{ marginLeft: 20, marginTop: 10, border: "1px solid #ddd", padding: 10, borderRadius: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <strong>{node.title}</strong>
        <button onClick={() => onAdd(node.id)} style={{ color: "green" }}>➕</button>
        {node.title !== "Director" && (
          <button onClick={() => onRemove(node.id)} style={{ color: "red" }}>❌</button>
        )}
      </div>

      <div>
        {node.children.map((child) => (
          <TreeNode key={child.id} node={child} onAdd={onAdd} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [tree, setTree] = useState<TreeNodeType>({
    id: 1,
    title: "Director",
    children: [],
  });

  const addNode = (parentId: number) => {
    const newNode: TreeNodeType = {
      id: idCounter++,
      title: `Member ${idCounter}`,
      children: [],
    };

    const updateTree = (node: TreeNodeType): TreeNodeType => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      }
      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };

    setTree(updateTree(tree));
  };

  const removeNode = (nodeId: number) => {
    const removeFromTree = (node: TreeNodeType): TreeNodeType => {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(removeFromTree),
      };
    };

    setTree(removeFromTree(tree));
  };

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Organizational Structure
      </h1>
      <TreeNode node={tree} onAdd={addNode} onRemove={removeNode} />
    </main>
  );
};

export default HomePage;
