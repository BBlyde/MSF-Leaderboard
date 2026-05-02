export function discordAvatarUrl(id, avatarHash) {
  if (avatarHash) {
    return `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.png?size=64`
  }
  const n = Number((BigInt(id) >> 22n) % 6n)
  return `https://cdn.discordapp.com/embed/avatars/${n}.png`
}

export function discordDisplayName(user) {
  if (!user) return ''
  return user.globalName || user.username || ''
}
