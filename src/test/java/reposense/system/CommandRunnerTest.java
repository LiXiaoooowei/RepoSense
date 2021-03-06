package reposense.system;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;

import org.junit.Assert;
import org.junit.Test;

import reposense.template.GitTestTemplate;
import reposense.util.TestConstants;
import reposense.util.TestUtil;


public class CommandRunnerTest extends GitTestTemplate {
    private static final String LATEST_COMMIT_HASH = "2d87a431fcbb8f73a731b6df0fcbee962c85c250";
    private static final String FEBRUARY_EIGHT_COMMIT_HASH = "768015345e70f06add2a8b7d1f901dc07bf70582";

    @Test
    public void cloneTest() {
        Path dir = Paths.get(TestConstants.LOCAL_TEST_REPO_ADDRESS);
        Assert.assertTrue(Files.exists(dir));
    }

    @Test
    public void checkoutTest() {
        CommandRunner.checkout(TestConstants.LOCAL_TEST_REPO_ADDRESS, "test");
        Path branchFile = Paths.get(TestConstants.LOCAL_TEST_REPO_ADDRESS, "inTestBranch.java");
        Assert.assertTrue(Files.exists(branchFile));
    }

    @Test
    public void log_existingFormats_hasContent() {
        String content =
                CommandRunner.gitLog(TestConstants.LOCAL_TEST_REPO_ADDRESS, null, null, config.getFormats());
        Assert.assertFalse(content.isEmpty());
    }

    @Test
    public void log_nonExistingFormats_noContent() {
        String content =
                CommandRunner.gitLog(TestConstants.LOCAL_TEST_REPO_ADDRESS, null, null, Arrays.asList("py"));
        Assert.assertTrue(content.isEmpty());
    }

    @Test
    public void log_sinceDateInFuture_noContent() {
        Date date = TestUtil.getDate(2050, Calendar.JANUARY, 1);
        String content = CommandRunner.gitLog(
                TestConstants.LOCAL_TEST_REPO_ADDRESS, date, null, config.getFormats());
        Assert.assertTrue(content.isEmpty());

        date = TestUtil.getDate(1950, Calendar.JANUARY, 1);
        content = CommandRunner.gitLog(
                TestConstants.LOCAL_TEST_REPO_ADDRESS, null, date, config.getFormats());
        Assert.assertTrue(content.isEmpty());
    }

    @Test
    public void blameRaw_validFile_success() {
        String content = CommandRunner.blameRaw(TestConstants.LOCAL_TEST_REPO_ADDRESS, "blameTest.java");
        Assert.assertFalse(content.isEmpty());
    }

    @Test(expected = RuntimeException.class)
    public void blameRaw_nonExistentFile_throwsRunTimeException() {
        CommandRunner.blameRaw(TestConstants.LOCAL_TEST_REPO_ADDRESS, "nonExistentFile");
    }

    @Test
    public void diffCommit_validCommitHash_success() {
        String diffResult = CommandRunner.diffCommit(config.getRepoRoot(), FEBRUARY_EIGHT_COMMIT_HASH);
        Assert.assertFalse(diffResult.isEmpty());
    }

    @Test
    public void diffCommit_emptyCommitHash_emptyResult() {
        String diffResult = CommandRunner.diffCommit(config.getRepoRoot(), LATEST_COMMIT_HASH);
        Assert.assertTrue(diffResult.isEmpty());
    }

    @Test
    public void diffCommit_latestCommitHash_emptyResult() {
        String diffResult = CommandRunner.diffCommit(config.getRepoRoot(), "");
        Assert.assertTrue(diffResult.isEmpty());
    }

    @Test(expected = RuntimeException.class)
    public void diffCommit_invalidCommitHash_throwsRunTimeException() {
        CommandRunner.diffCommit(config.getRepoRoot(), "invalidBranch");
    }

    @Test
    public void getCommitHashBeforeDate_beforeInitialCommitDate_emptyResult() {
        Date date = TestUtil.getDate(2018, Calendar.FEBRUARY, 4);
        String commitHash = CommandRunner.getCommitHashBeforeDate(config.getRepoRoot(), config.getBranch(), date);
        Assert.assertTrue(commitHash.isEmpty());
    }

    @Test
    public void getCommitHashBeforeDate_afterLatestCommitDate_success() {
        Date date = TestUtil.getDate(2018, Calendar.MAY, 10);
        String commitHash = CommandRunner.getCommitHashBeforeDate(config.getRepoRoot(), config.getBranch(), date);

        // result from git has a newline at the end
        Assert.assertEquals(LATEST_COMMIT_HASH + "\n", commitHash);
    }

    @Test
    public void getCommitHashBeforeDate_februaryNineDate_success() {
        Date date = TestUtil.getDate(2018, Calendar.FEBRUARY, 9);
        String commitHash = CommandRunner.getCommitHashBeforeDate(config.getRepoRoot(), config.getBranch(), date);

        // result from git has a newline at the end
        Assert.assertEquals(FEBRUARY_EIGHT_COMMIT_HASH + "\n", commitHash);
    }

    @Test
    public void getCommitHashBeforeDate_nullDate_emptyResult() {
        String commitHash = CommandRunner.getCommitHashBeforeDate(config.getRepoRoot(), config.getBranch(), null);
        Assert.assertTrue(commitHash.isEmpty());
    }

    @Test(expected = RuntimeException.class)
    public void getCommitHashBeforeDate_invalidBranch_throwsRunTimeException() {
        Date date = TestUtil.getDate(2018, Calendar.FEBRUARY, 9);
        CommandRunner.getCommitHashBeforeDate(config.getRepoRoot(), "invalidBranch", date);
    }
}
