import useInboxCachedImage from '../../hooks/useInboxCachedImage'
import useSearchCachedImage from '../../hooks/useSearchCachedImage'

function InboxCachedImg({ src, ...imgProps }) {
  const cachedSrc = useInboxCachedImage(src)
  return <img src={cachedSrc || src} {...imgProps} />
}

function SearchCachedImg({ src, ...imgProps }) {
  const cachedSrc = useSearchCachedImage(src)
  return <img src={cachedSrc || src} {...imgProps} />
}

export default function CachedImage({ cacheStrategy, src, ...imgProps }) {
  if (cacheStrategy === 'search') {
    return <SearchCachedImg src={src} {...imgProps} />
  }
  return <InboxCachedImg src={src} {...imgProps} />
}
