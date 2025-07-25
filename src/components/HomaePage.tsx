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
    <div className="ml-4 mt-5 border-1 border-black p-5">
      <div className="flex items-center gap-3">
        <h3>{node.title}</h3>
        <button onClick={() => onAdd(node.id)}>add</button>
        {node.title !== "Director" && (
          <button onClick={() => onRemove(node.id)}>remove</button>
        )}
      </div>

      <div>
        {node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            onAdd={onAdd}
            onRemove={onRemove}
          />
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
      title: `Subordinator`,
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
    <main className="p-5">
      <h1 className="mb-5">Organizational Structure</h1>
      <TreeNode node={tree} onAdd={addNode} onRemove={removeNode} />
    </main>
  );
};

export default HomePage;
