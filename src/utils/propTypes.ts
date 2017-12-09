import PropTypes from 'prop-types'

export const fieldShape = PropTypes.shape({
  dirty: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
})
