import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function WrapperFun(Component) {
  return function WrappedComponent(props) {
    return (
      <DndProvider backend={HTML5Backend}>
        <Component {...props} />
      </DndProvider>
    );
  };
}
