# React Sortable

Sortable component for ReactJS. Demo [here](https://mgechev.github.io/react-reorderable/).

# Demo

```jsx
React.render(
  <ReactReorderable>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
  </ReactReorderable>,
  document.getElementById('container')
);
```

# API

## Properties

- `handle` - a selector, which provides the handle element
- `mode` - `grid` or `list`, `list` will work in the general case but `grid` is eventually smarter for grid layout

## Events

- `onDragStart`
- `onDrag`
- `onDrop`
- `onChange`

# License

MIT
