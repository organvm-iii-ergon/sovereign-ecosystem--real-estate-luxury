from playwright.sync_api import Page, expect, sync_playwright

def verify_client_auth(page: Page):
    """
    Verifies the ClientAuth component accessibility and interaction improvements.
    """
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:5000")

    # 2. Select Client Experience
    # RoleSelector is the first screen.
    client_button = page.get_by_label("Select client browsing experience")
    expect(client_button).to_be_visible()
    client_button.click()

    # Now we should be at ClientAuth
    expect(page.get_by_text("Velvet Rope Entry")).to_be_visible()

    # 3. Check for Accessibility: Input should have aria-label "Invite Code"
    invite_input = page.get_by_label("Invite Code")
    expect(invite_input).to_be_visible()

    # 4. Act: Type a code and Click Enter
    invite_input.fill("TESTCODE")

    # Find the submit button. It should be enabled now.
    submit_button = page.get_by_role("button", name="Enter")
    expect(submit_button).to_be_enabled()

    submit_button.click()

    # 5. Assert & Screenshot: Check for "Validating..." state which should have the spinner
    # Since it's a fast transition (1s), we check immediately.
    # The text changes to "Validating..."
    expect(page.get_by_text("Validating...")).to_be_visible()

    # Take a screenshot while validating
    page.screenshot(path="/home/jules/verification/client_auth_validating.png")

    # Wait for the next step (BiometricScan) to confirm full flow works
    expect(page.get_by_text("Authenticating...")).to_be_visible()

    # Take another screenshot of the BiometricScan
    page.screenshot(path="/home/jules/verification/biometric_scan.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_client_auth(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
        finally:
            browser.close()
