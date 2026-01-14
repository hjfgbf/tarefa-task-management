import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskCardList } from './TaskCardList';

interface TreeNode {
  task: Task;
  children: TreeNode[];
}

interface TreeViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}

export function TreeView({ tasks, onTaskClick, onTaskEdit, onTaskDelete }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Build tree structure
  const buildTree = (tasks: Task[]): TreeNode[] => {
    const taskMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create nodes for all tasks
    tasks.forEach(task => {
      taskMap.set(task.id, {
        task,
        children: []
      });
    });

    // Build tree structure
    tasks.forEach(task => {
      const node = taskMap.get(task.id)!;
      
      if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
        const parentNode = taskMap.get(task.parent_task_id)!;
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const toggleNode = (taskId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.task.id);

    return (
      <div key={node.task.id} className="w-full">
        <div className={`flex items-start ${level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.task.id)}
              className="flex-shrink-0 p-1 mr-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          
          {!hasChildren && level > 0 && (
            <div className="w-6 h-6 mr-2 mt-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}

          <div className="flex-1">
            <TaskCardList
              task={node.task}
              onClick={() => onTaskClick?.(node.task)}
              showActions={true}
              onEdit={() => onTaskEdit?.(node.task)}
              onDelete={() => onTaskDelete?.(node.task)}
            />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(tasks);

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <Folder className="h-12 w-12 mb-4" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map(node => renderNode(node))}
    </div>
  );
}