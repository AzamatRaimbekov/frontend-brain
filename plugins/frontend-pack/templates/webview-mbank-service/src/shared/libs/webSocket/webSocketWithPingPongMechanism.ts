interface ConnectEvent {
  onError?(event: Event): void
  onMessage?(message: MessageEvent<unknown>): void
}
export class WebSocketWithPingPongMechanism {
  socket: WebSocket
  isConnected = false
  pingTimeout: ReturnType<typeof setTimeout> | null = null
  interval: ReturnType<typeof setTimeout> | null = null
  connectionTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(url: string) {
    this.socket = new WebSocket(url)
  }

  ping = () => {
    this.send('ping')
    this.pingTimeout = setTimeout(() => {
      this.disconnect()
    }, 5e3)
  }
  pong = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.pingTimeout && clearTimeout(this.pingTimeout)
  }

  send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    this.socket.send(data)
  }
  connect = (event: ConnectEvent) => {
    this.socket.onopen = () => {
      this.isConnected = true
      // this.interval = setInterval(() => {
      //   this.ping()
      // }, 30e3)
    }
    this.socket.onmessage = (message) => {
      if (message.data === 'pong') {
        this.pong()
        return
      }

      event.onMessage?.(message)
    }
    this.socket.onclose = () => {
      this.isConnected = false
      this.connectionTimeout = setTimeout(() => {
        this.connect(event)
      }, 5e3)
    }
    this.socket.onerror = (e) => {
      console.log(e, '[error]')
      this.disconnect()
      event.onError?.(e)
      setTimeout(this.connect, 5e3)
    }

    return this.socket
  }

  clearTimeoutsAndIntervals = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.interval && clearInterval(this.interval)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.pingTimeout && clearTimeout(this.pingTimeout)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.connectionTimeout && clearTimeout(this.connectionTimeout)
  }

  disconnect = () => {
    this?.socket?.close(1000)

    this.clearTimeoutsAndIntervals()
    this.isConnected = false
  }
}
