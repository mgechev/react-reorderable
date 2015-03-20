function getClosestSortable(el) {
  while (el) {
    if (el.className &&
        el.className.indexOf('react-sortable-item') >= 0) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

var ReactSortable = React.createClass({displayName: "ReactSortable",
  componentDidMount: function () {
    // We don't need to store the current
    // active node inside the components state
    // since the component does not has to
    // re-render on change of the activeNode
    this.activeNode = null;
  },
  onDragStart: function (e) {
    // could be a handle
    var node = getClosestSortable(e.target);
    console.log('start', node);
    node.style.position = 'relative';
    this.activeNode = node;
  },
  onDragStop: function (e) {
    var node = getClosestSortable(e.target);
    console.log('stop', node);
    node.style.position = 'static';
    this.activeNode = null;
  },
  onDrag: function (e) {
    // we may need to update the state...
  },
  render: function () {
    var children = this.props.children.map(function (c) {
      c = React.addons.cloneWithProps(c, {
        className: 'react-sortable-item'
      });
      return (
        React.createElement(ReactDrag, {handle: this.props.handle, 
          onDrag: this.onDrag, 
          onStart: this.onDragStart, 
          onStop: this.onDragStop}, 
          c
        )
      );
    }, this);
    return (
      React.createElement("div", null, 
        children
      )
    );
  }
});
