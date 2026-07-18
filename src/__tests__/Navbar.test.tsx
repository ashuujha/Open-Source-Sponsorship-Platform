import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { useWalletStore } from "../state/useWalletStore";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    init: vi.fn(),
    authModal: vi.fn(),
    disconnect: vi.fn(),
    signTransaction: vi.fn(),
  },
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
  },
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/freighter", () => ({
  FreighterModule: class {},
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/albedo", () => ({
  AlbedoModule: class {},
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/xbull", () => ({
  xBullModule: class {},
}));

describe("Navbar Component", () => {
  it("renders Navbar branding and navigational links", () => {
    render(<Navbar />);
    expect(screen.getByText("Stellar")).toBeInTheDocument();
    expect(screen.getByText("Sponsor")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Live Feed")).toBeInTheDocument();
    expect(screen.getByText("Tx Center")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("displays connect wallet button when disconnected", () => {
    useWalletStore.getState().disconnect();
    render(<Navbar />);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("displays truncated address when wallet is connected", () => {
    useWalletStore.getState().setWallet("GBAddressForTestingPurposeOnly123", "Freighter", "TESTNET");
    render(<Navbar />);
    expect(screen.getByText("GBAd...y123")).toBeInTheDocument();
  });
});
