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

function getNextNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var current;
  var minDistance = Infinity;
  var next = null;
  var offsetTop = node.offsetTop;
  for (var i = 0; i < siblings.length; i += 1) {
    current = siblings[i];
    if (current !== node) {
      var diff = current.offsetTop - offsetTop;
      if (diff > 0 && diff < minDistance) {
        minDistance = diff;
        next = current;
      }
    }
  }
  return next;
}

var ReactSortable = React.createClass({
  _indexChildren: function (c) {
    var ids = [];
    var prefix = 'node-';
    var id;
    this.sortableMap = {};
    for (var i = 0; i < c.length; i += 1) {
      id = prefix + (i + 1);
      ids.push(id);
      c[i] = React.addons.cloneWithProps(c[i], {
        className: 'react-sortable-item',
        'data-sortable-id': id
      });
      this.sortableMap[id] = c[i];
    }
    this.setState({
      order: ids
    });
  },
  componentWillMount: function () {
    this._indexChildren(this.props.children)
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.children) {
      this._indexChildren(nextProps.children);
    }
  },
  getInitialState: function () {
    // Our state doesn't depends on activeNode
    // so it is not required to resides in the state
    this.activeNode = null;
    return { order: [], activeItem: null };
  },
  onDragStart: function (e) {
    // could be a handle
    var node = getClosestSortable(e.target);
    this.activeNode = node;
    this.setState({
      activeItem: node.getAttribute('data-sortable-id')
    });
  },
  onDragStop: function (e) {
    this.activeNode.style.top = '0px';
    this.activeNode.style.left = '0px';
    this.activeNode = null;
    this.setState({
      activeItem: null
    });
  },
  onDrag: function (e) {
    var currentNextNode = this.activeNode.nextSibling;
    var nextNode = getNextNode(this.activeNode);

    if (currentNextNode === nextNode) {
      return;
    }

    var id = this.activeNode.getAttribute('data-sortable-id');
    var order = this.state.order;
    var afterIdx = order.length;
    order.splice(order.indexOf(id), 1);
    if (nextNode) {
      afterIdx = order.indexOf(nextNode.getAttribute('data-sortable-id'));
      console.log(afterIdx);
    }
    order.splice(afterIdx, 0, id);
    this.setState({
      order: order
    });
  },
  render: function () {
    var children = this.state.order.map(function (id) {
      var c = this.sortableMap[id];
      if (id === this.state.activeItem) {
        c = React.addons.cloneWithProps(c, {
          className: 'react-sortable-item-active'
        });
      }
      return (
        <ReactDrag handle={this.props.handle}
          onDrag={this.onDrag}
          onStart={this.onDragStart}
          onStop={this.onDragStop}>
          {c}
        </ReactDrag>
      );
    }, this);
    return (
      <div ref="wrapper">
        {children}
      </div>
    );
  }
});
