
import React, { useEffect, useRef, useState } from 'react'
import Epub, { Book } from 'epubjs'
import type { NavItem, Contents, Rendition, Location } from 'epubjs'
import { EpubViewStyle as defaultStyles, type IEpubViewStyle } from './style'
import type { RenditionOptions } from 'epubjs/types/rendition'
import type { BookOptions } from 'epubjs/types/book'

export type RenditionOptionsFix = RenditionOptions & {
  allowPopups: boolean
}

export type IToc = {
  label: string
  href: string
}

export type IEpubViewProps = {
  url: string | ArrayBuffer
  epubInitOptions?: Partial<BookOptions>
  epubOptions?: Partial<RenditionOptionsFix>
  epubViewStyles?: IEpubViewStyle
  loadingView?: React.ReactNode
  location: string | number | null
  locationChanged(value: string): void
  showToc?: boolean
  tocChanged?(value: NavItem[]): void
  getRendition?(rendition: Rendition): void
  handleKeyPress?(): void
  handleTextSelected?(cfiRange: string, contents: Contents): void
}

export function EpubView({
  url,
  epubInitOptions,
  epubOptions,
  epubViewStyles = defaultStyles,
  loadingView = null,
  location: initialLocation,
  locationChanged,
  tocChanged,
  getRendition: getRenditionProp,
  handleKeyPress: handleKeyPressProp,
  handleTextSelected
}: IEpubViewProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [toc, setToc] = useState<NavItem[]>([])
  const viewerRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<string | number | null>(initialLocation)
  const bookRef = useRef<Book>()
  const renditionRef = useRef<Rendition>()
  const prevPageRef = useRef<() => void>()
  const nextPageRef = useRef<() => void>()

  const initBook = () => {
    if (bookRef.current) {
      bookRef.current.destroy()
    }
    bookRef.current = Epub(url, epubInitOptions)
    bookRef.current.loaded.navigation.then(({ toc }) => {
      setIsLoaded(true)
      setToc(toc)
      tocChanged?.(toc)
      initReader()
    })
  }

  const initReader = () => {
    if (viewerRef.current && bookRef.current) {
      const rendition = bookRef.current.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        ...epubOptions,
      })
      renditionRef.current = rendition
      prevPageRef.current = () => rendition.prev()
      nextPageRef.current = () => rendition.next()
      registerEvents()
      getRenditionProp?.(rendition)

      if (typeof initialLocation === 'string' || typeof initialLocation === 'number') {
        rendition.display(initialLocation + '')
      } else if (toc.length > 0 && toc[0].href) {
        rendition.display(toc[0].href)
      } else {
        rendition.display()
      }
    }
  }

  const registerEvents = () => {
    if (renditionRef.current) {
      renditionRef.current.on('locationChanged', onLocationChange)
      renditionRef.current.on('keyup', handleKeyPressProp || handleKeyPress)
      if (handleTextSelected) {
        renditionRef.current.on('selected', handleTextSelected)
      }
    }
  }

  const onLocationChange = (loc: Location) => {
    const newLocation = `${loc.start}`
    if (locationRef.current !== newLocation) {
      locationRef.current = newLocation
      locationChanged(newLocation)
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' && nextPageRef.current) {
      nextPageRef.current()
    }
    if (event.key === 'ArrowLeft' && prevPageRef.current) {
      prevPageRef.current()
    }
  }

  useEffect(() => {
    initBook()
    document.addEventListener('keyup', handleKeyPress, false)
    return () => {
      if (bookRef.current) {
        bookRef.current.destroy()
      }
      document.removeEventListener('keyup', handleKeyPress, false)
    }
  }, [url])

  useEffect(() => {
    if (renditionRef.current && initialLocation !== locationRef.current) {
      renditionRef.current.display(initialLocation + '')
    }
  }, [initialLocation])

  return (
    <div style={epubViewStyles.viewHolder}>
      {(isLoaded && <div ref={viewerRef} style={epubViewStyles.view} />) || loadingView}
    </div>
  )
}
