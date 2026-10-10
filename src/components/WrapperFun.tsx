import type { ComponentType } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function WrapperFun<P extends object>(Component: ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <DndProvider backend={HTML5Backend}>
        <Component {...props} />
      </DndProvider>
    );
  };
}
