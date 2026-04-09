type StatusBannerProps = {
  message: string;
};

export function StatusBanner({ message }: StatusBannerProps) {
  return <div className="status-banner">{message}</div>;
}
