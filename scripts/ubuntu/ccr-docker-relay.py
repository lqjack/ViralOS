#!/usr/bin/env python3
"""TCP relay: 0.0.0.0:3457 → 127.0.0.1:3456 (Docker → SSH tunnel → Mac CCR)."""
import socket
import sys
import threading

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3457
UPSTREAM = ("127.0.0.1", int(sys.argv[2]) if len(sys.argv) > 2 else 3456)


def pump(src: socket.socket, dst: socket.socket) -> None:
    try:
        while True:
            data = src.recv(65536)
            if not data:
                break
            dst.sendall(data)
    except OSError:
        pass
    finally:
        for s in (src, dst):
            try:
                s.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass


def relay(client: socket.socket) -> None:
    try:
        upstream = socket.create_connection(UPSTREAM, timeout=30)
    except OSError:
        client.close()
        return
    t1 = threading.Thread(target=pump, args=(client, upstream), daemon=True)
    t2 = threading.Thread(target=pump, args=(upstream, client), daemon=True)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    client.close()
    upstream.close()


def main() -> None:
    listen = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listen.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listen.bind((LISTEN_HOST, LISTEN_PORT))
    listen.listen(64)
    while True:
        client, _ = listen.accept()
        threading.Thread(target=relay, args=(client,), daemon=True).start()


if __name__ == "__main__":
    main()
