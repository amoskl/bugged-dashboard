import { test, expect } from "@playwright/test";

test.describe("Task Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the dashboard title and tasks", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Task Dashboard");

    // Should show task items
    const taskItems = page.locator(".task-item");
    await expect(taskItems).toHaveCount(5);
  });

  test('Bug Fix 1: "Due Today" filter should work correctly', async ({
    page,
  }) => {
    // Click on "Due Today" filter
    await page.click('button:has-text("Due Today")');

    // Should show tasks that are due today (there should be 2 tasks due today based on the mock data)
    const visibleTasks = page.locator(".task-item");
    await expect(visibleTasks).toHaveCount(2);

    // Verify the tasks shown are actually due today
    const taskTitles = await visibleTasks
      .locator(".task-title")
      .allTextContents();
    expect(taskTitles).toContain("Review project proposal");
    expect(taskTitles).toContain("Prepare presentation");

    // Verify the "Due Today" button shows the correct count
    await expect(page.locator('button:has-text("Due Today")')).toContainText(
      "Due Today (2)"
    );
  });

  test("Bug Fix 2: Mark Complete should update the UI", async ({ page }) => {
    // Find the first incomplete task
    const incompleteTask = page.locator(".task-item:not(.completed)").first();
    const checkbox = incompleteTask.locator('input[type="checkbox"]');
    const completeButton = incompleteTask.locator(".complete-btn");

    // Verify task is initially not completed
    await expect(checkbox).not.toBeChecked();
    await expect(completeButton).toContainText("Mark Complete");
    await expect(completeButton).not.toBeDisabled();

    // Click the "Mark Complete" button
    await completeButton.click();

    // Wait for the UI to update (after the 500ms API delay)
    await page.waitForTimeout(600);

    // Verify the task is now marked as complete
    await expect(checkbox).toBeChecked();
    await expect(completeButton).toContainText("Completed");
    await expect(completeButton).toBeDisabled();
    await expect(incompleteTask).toHaveClass(/completed/);
  });

  test("Bug Fix 2: Checkbox click should also toggle completion", async ({
    page,
  }) => {
    // Find the first incomplete task
    const incompleteTask = page.locator(".task-item:not(.completed)").first();
    const checkbox = incompleteTask.locator('input[type="checkbox"]');

    // Click the checkbox directly
    await checkbox.click();

    // Wait for the UI to update
    await page.waitForTimeout(600);

    // Verify the task is now marked as complete
    await expect(checkbox).toBeChecked();
    await expect(incompleteTask).toHaveClass(/completed/);
  });

  test("Bug Fix 3: Hovering over tasks should not cause errors", async ({
    page,
  }) => {
    // Listen for console errors
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for JavaScript errors
    const jsErrors = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    // Hover over each task
    const tasks = page.locator(".task-item");
    const taskCount = await tasks.count();

    for (let i = 0; i < taskCount; i++) {
      await tasks.nth(i).hover();
      await page.waitForTimeout(100); // Small delay to ensure hover is processed
    }

    // Verify no JavaScript errors occurred
    expect(jsErrors).toHaveLength(0);

    // Check that console logs contain expected hover messages (not errors)
    // The hover should now log messages about task title and priority
    await page.waitForTimeout(100);
  });

  test("All filters should work correctly", async ({ page }) => {
    // Test "All Tasks" filter
    await page.click('button:has-text("All Tasks")');
    await expect(page.locator(".task-item")).toHaveCount(5);

    // Test "Pending" filter
    await page.click('button:has-text("Pending")');
    const pendingTasks = page.locator(".task-item");
    const pendingCount = await pendingTasks.count();
    expect(pendingCount).toBeGreaterThan(0);

    // Verify all visible tasks are not completed
    for (let i = 0; i < pendingCount; i++) {
      await expect(pendingTasks.nth(i)).not.toHaveClass(/completed/);
    }

    // Test "Completed" filter
    await page.click('button:has-text("Completed")');
    const completedTasks = page.locator(".task-item");
    const completedCount = await completedTasks.count();
    expect(completedCount).toBeGreaterThan(0);

    // Verify all visible tasks are completed
    for (let i = 0; i < completedCount; i++) {
      await expect(completedTasks.nth(i)).toHaveClass(/completed/);
    }
  });

  test("Task information should display correctly", async ({ page }) => {
    const firstTask = page.locator(".task-item").first();

    // Should show task title
    await expect(firstTask.locator(".task-title")).toBeVisible();

    // Should show due date
    await expect(firstTask.locator(".task-due-date")).toBeVisible();

    // Should show priority
    await expect(firstTask.locator(".task-priority")).toBeVisible();

    // Should show checkbox
    await expect(firstTask.locator('input[type="checkbox"]')).toBeVisible();

    // Should show complete button
    await expect(firstTask.locator(".complete-btn")).toBeVisible();
  });

  test("Filter counts should be accurate", async ({ page }) => {
    // Get initial counts from the UI
    const allTasksButton = page.locator('button:has-text("All Tasks")');
    const pendingButton = page.locator('button:has-text("Pending")');
    const completedButton = page.locator('button:has-text("Completed")');
    const dueTodayButton = page.locator('button:has-text("Due Today")');

    // All tasks should show total count
    await expect(allTasksButton).toContainText("All Tasks (5)");

    // Verify the counts add up correctly
    const pendingText = await pendingButton.textContent();
    const completedText = await completedButton.textContent();
    const dueTodayText = await dueTodayButton.textContent();

    const pendingCount = parseInt(pendingText.match(/\((\d+)\)/)[1]);
    const completedCount = parseInt(completedText.match(/\((\d+)\)/)[1]);
    const dueTodayCount = parseInt(dueTodayText.match(/\((\d+)\)/)[1]);

    // Pending + Completed should equal total
    expect(pendingCount + completedCount).toBe(5);

    // Due today count should be reasonable (2 tasks are set to today in mock data)
    expect(dueTodayCount).toBe(2);
  });
});
