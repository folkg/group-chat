import Home from "../pages/Home";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Home component", () => {
  it("renders the component", () => {
    const wrapper = render(<Home />);
    expect(wrapper).toBeTruthy();

    // Get by h1
    const h1 = wrapper.container.querySelector("h1");
    expect(h1?.textContent).toBe("Welcome to Group Chat");

    // Get by text using the React testing library
    const text = screen.getByText(/welcome to group chat/i);
    expect(text.textContent).toBeTruthy();
  });

  it("disables the create new room button when name is empty", () => {
    render(<Home />);
    const createButton = screen.getByRole("button", {
      name: /create new room/i,
    });
    expect(createButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: " " } });
    expect(createButton).toBeDisabled();
  });

  it("enables the create new room button when name is not empty and room ID is empty", () => {
    render(<Home />);
    const createButton = screen.getByRole("button", {
      name: /create new room/i,
    });
    expect(createButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: "John" } });
    expect(createButton).toBeEnabled();
  });

  it("disables the create new room button when name is empty", () => {
    render(<Home />);
    const createButton = screen.getByRole("button", {
      name: /create new room/i,
    });
    expect(createButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: "John" } });
    expect(createButton).toBeEnabled();

    const roomIdInput = screen.getByLabelText(/room id/i);
    fireEvent.change(roomIdInput, { target: { value: "123" } });
    expect(createButton).toBeDisabled();
  });

  it("disables the join existing room button when room ID is empty", () => {
    render(<Home />);
    const joinButton = screen.getByRole("button", {
      name: /join existing room/i,
    });
    expect(joinButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: "John" } });
    expect(joinButton).toBeDisabled();

    const roomIdInput = screen.getByLabelText(/room id/i);
    fireEvent.change(roomIdInput, { target: { value: " " } });
    expect(joinButton).toBeDisabled();
  });

  it("enables the join existing room button when name and room ID are not empty", () => {
    render(<Home />);
    const joinButton = screen.getByRole("button", {
      name: /join existing room/i,
    });
    expect(joinButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: "John" } });
    expect(joinButton).toBeDisabled();

    const roomIdInput = screen.getByLabelText(/room id/i);
    fireEvent.change(roomIdInput, { target: { value: "123" } });
    expect(joinButton).toBeEnabled();
  });
});
