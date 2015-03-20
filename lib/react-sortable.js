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

function getCurrentPosition(node) {
  var p = node.parentNode;
  var siblings = p.children;
  for (var i = 0; i < siblings.length; i += 1) {
    if (siblings[i] === node) {
      return {
        prev: siblings[i - 1] || null,
        next: siblings[i + 1] || null
      };
    }
  }
  return {
    prev: null,
    next: null
  };
}

function getNodePosition(node) {
  return {
    next: getNextNode(node),
    prev: getPrevNode(node)
  };
}

function getNextNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var minDistance = Infinity;
  var next = null;
  var current;
  for (var i = 0; i < siblings.length; i += 1) {
    current = siblings[i];
    if (current !== node) {
      if (current.offsetTop > node.offsetTop &&
          current.offsetTop - node.offsetTop < minDistance) {
        minDistance = current.offsetTop - node.offsetTop;
        next = current;
      }
    }
  }
  return next;
}

function getPrevNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var minDistance = Infinity;
  var prev = null;
  var current;
  for (var i = siblings.length - 1; i >= 0; i -= 1) {
    current = siblings[i];
    if (current !== node) {
      if (current.offsetTop < node.offsetTop &&
          node.offsetTop - current.offsetTop < minDistance) {
        minDistance = node.offsetTop - current.offsetTop;
        prev = current;
      }
    }
  }
  return prev;
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
    return { order: [] };
  },
  onDragStart: function (e) {
    // could be a handle
    var node = getClosestSortable(e.target);
    node.style.position = 'relative';
    this.activeNode = node;
  },
  onDragStop: function (e) {
    this.activeNode.style.position = 'static';
    this.activeNode.style.left = '0px';
    this.activeNode.style.top = '0px';
    this.activeNode = null;
  },
  onDrag: function (e) {
    var position = getNodePosition(this.activeNode);
    var currentPosition = getCurrentPosition(this.activeNode);
    if (position) {
      // Only one of the positions could differ only
      // if the children update somehow but we should lose
      // the drag anyway...
      if (position.next !== currentPosition.next ||
          position.prev !== currentPosition.prev) {
        // update the state
        var id = this.activeNode.getAttribute('data-sortable-id');
        var order = this.state.order;
        var afterIdx = order.length;
        if (position.next) {
          afterIdx = order.indexOf(position.next.getAttribute('data-sortable-id'));
        }
        this.setState(React.addons.update(this.state, {
          order: {
            $splice: [
              [order.indexOf(id), 1],
              [afterIdx, 0, id]
            ]
          }
        }));
      }
    }
  },
  render: function () {
    var children = this.state.order.map(function (id) {
      var c = this.sortableMap[id];
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
