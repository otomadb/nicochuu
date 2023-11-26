FROM denoland/deno:1.38.1 AS builder

WORKDIR /app

COPY deno.json deno.lock *.ts ./
RUN deno task compile

FROM gcr.io/distroless/static-debian12 AS runner

WORKDIR /app

COPY --from=builder /app/nicochuu .

CMD ["/app/nicochuu"]
