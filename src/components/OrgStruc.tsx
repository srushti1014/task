"use client"

import React, { useState } from 'react'

interface TreeNodeType {
    id: number,
    name: string,
    children: TreeNodeType[]
}
let idIncrease = 2;
const OrgStruc = () => {
    const [tree, setTree] = useState<TreeNodeType>({
        id: 1,
        name: "Director",
        children: [],
      });
    
      const addNode = (parentId: number) => {
        const newNode: TreeNodeType = {
          id: idIncrease++,
          name: `Subordinator`,
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
    <div className='p-5'>
        <h1>Organizational; Structure</h1>
        <div> Director <button onClick={makeSubOrdinate}>...</button></div>
    </div>
  )
}