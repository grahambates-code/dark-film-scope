import { Mark, mergeAttributes } from '@tiptap/core';

export interface ViewStateOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    viewState: {
      setViewState: (viewState: any) => ReturnType;
      unsetViewState: () => ReturnType;
    };
  }
}

export const ViewState = Mark.create<ViewStateOptions>({
  name: 'viewState',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      viewState: {
        default: null,
        parseHTML: element => {
          const viewStateStr = element.getAttribute('data-viewstate');
          return viewStateStr ? JSON.parse(viewStateStr) : null;
        },
        renderHTML: attributes => {
          if (!attributes.viewState) {
            return {};
          }
          return {
            'data-viewstate': JSON.stringify(attributes.viewState),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-viewstate]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'viewstate-mark bg-blue-100 text-blue-800 px-1 rounded cursor-pointer hover:bg-blue-200 transition-colors',
        title: 'Click to view camera position',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setViewState:
        (viewState: any) =>
        ({ commands }) => {
          return commands.setMark(this.name, { viewState });
        },
      unsetViewState:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});