module.exports = (sequelize, DataType) => {
  const post = sequelize.define('post', {
    message: {
      type: DataType.STRING(500)
    },
    image_url: {
      type: DataType.STRING(500)
    }
  })

  return post
}