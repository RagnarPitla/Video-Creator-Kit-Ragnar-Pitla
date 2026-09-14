# AI LABS - Unlazy video (c47uqR7XB_c) - transcript

**[00:00:00]** There's a fundamental problem with AI models. Whenever you give them tasks, they never take ownership of that task, and this is why we always have to review the agent's output because we cannot trust it. But this laziness problem just got solved. So, GitHub's number one trending author has a solution for this, and this is the person who also made the

**[00:00:18]** design taste skill, which is one of the most popular design skills out right now. He has built a new skill called Unlazy that solves this exact problem in AI agents. The workflow behind Unlazy is really creative. But after running it ourselves, we came across a huge problem with how slow it was, and we found a way to fix that as well. Now, if you're new

**[00:00:38]** here, then welcome. We're a software company, and this is AI labs. In this video, we're going over what Unlazy is, how it actually works, the problem it has, and the change we made to fix it. Now, laziness is a problem that basically shows up no matter which model you're using, even the most powerful ones like Opus and GPT 5.6. It just

**[00:00:56]** becomes easier to notice in the smaller models because they have far fewer capabilities, and their limitations become obvious much faster. And Unlazy is built to fix exactly that. This skill forces the agent to stop being lazy with its inbuilt mechanism and deliver what you actually need. And the main idea behind it is that it doesn't tell you

**[00:01:14]** the agent is done, it proves it. It checks the work against a ledger, which is basically a checklist where every item has to have proof that it's actually done. So, instead of just telling you the work is complete, it shows you the proof for every part of it. And it works with all the popular agents like Claude Code, Codex, and

**[00:01:31]** more. But to understand why this skill matters, you need to know what happens without it and how adding this one solves that problem. But before we go deeper into it, it would be great if you subscribe to the channel and hit the hype button. This small gesture of support goes a long way for us. &gt;&gt; [snorts] &gt;&gt; Now, before actually exploring the

**[00:01:48]** skill, we need to understand why the agents get lazy in the first place. Now, on a fresh context window, you might not notice that at all. There's barely anything in there yet, which is why the model can focus way better on the task you gave it. But, it will be more visible as the context fills up. Now, these models don't have any inbuilt

**[00:02:04]** memory, so they actually don't know what happened in the previous message you sent. So, how does it know what happened before? These agents send all of the previous messages along with your new prompt, so the model knows what has already happened. But, as you send more and more messages, that pile keeps growing, and there's a lot more for the

**[00:02:20]** model to pay attention to at one time. And this is exactly why the agents aren't able to focus as clearly on each part of the task and just slack off while they're working through it. And this laziness happens in two different ways. The first is that the agent tells you it's done when it isn't. There's been many times when you ask Claude code

**[00:02:37]** to work through many files, it just opens a few instead of actually looking at all of them and reports that it went through everything. And that's the part that actually costs you. A model that stops early with clearly unfinished work is acceptable, but when it stops early and tells you it finished everything, that's where it becomes a problem. You

**[00:02:53]** don't actually know if it's completed until you verify it yourself. So, if you don't, and you build more on top of that unfinished work, you're going to run into problems in the long run. And the second is that it shrinks the job without telling you. So, for example, you ask for something that has five parts to it, and one of those parts is

**[00:03:09]** difficult. It builds the four easy ones and skips the hard one. And the summary you get at the end never mentions anything's missing. Now, you might be thinking this isn't a new problem, and you'd be right, because these problems have always been there with these agents, and people have been building fixes for them for a long time. You

**[00:03:25]** probably already know about the Ralph loop. That one keeps sending the agent back the same prompt again and again until an indicator in its output says the task is done. And there's also Claude's gold command, which uses another model as a judge. And we've built loops like this ourselves, too, where a task list held the checks that

**[00:03:42]** every task had to pass. But, all of these have a limit to them. With Ralph, that finish line is just a bit of text the agent writes while it's working. But, a a of tasks can't be judged by a finish line. There's no single word that tells you a feature is actually built properly. And the goal command uses a smaller model that reads through the

**[00:03:59]** conversation to decide whether the work is finished. So, it's judging by what the conversation says instead of the work itself, and it can drift from what you actually needed. And with our own loops, those checks were real, but it was the agent itself that graded them. So, it was still the agent deciding whether it was done. And they can all

**[00:04:16]** work really well when your context window is fresh. But once you're deep in the real work, they start to falter. And that's exactly the point where you need them to hold. But before we show the whole workflow that fixes these problems, let's have a word by our sponsor, Data for SEO. If you vibe coded an SEO tool or marketing dashboard, you

**[00:04:33]** know it's only as good as the data behind it. And real SEO data usually means an expensive monthly subscription before you've even shipped. Data for SEO fixes that. It's one of the top SEO data providers in the world with over 10 APIs covering everything from keywords and backlinks to competitor and AI search visibility. In their dashboard, there's

**[00:04:54]** an API playground. We typed in a keyword and fired off one request and seconds later had the search volume and top ranking pages in front of us. Then it handed us the code we plugged into the app and our dashboard was pulling live ranking in under a minute. Setup took under 5 minutes. The pricing is where it really wins. There's no subscription and

**[00:05:11]** you pay as you go per request, so cost scale as you grow. Plus real human support around the clock, not a bot. Normally, you'd start with a $1 trial. Using our link bumps up to $5 in free credits. Go build with it. The link's in the pinned comment. Now, before we show you how to set this up, let's look at what's actually going on underneath and

**[00:05:29]** how that solves the problem. So, when you give this skill a large task, it doesn't start working on it. It breaks that task into smaller tasks first. And then it takes each one of those and breaks it into smaller tasks again. So, the whole thing branches out, one task turning into a few, and each of those turning into a few more. And that's why

**[00:05:47]** it's called a tree. And once it stops splitting, every small task at the end gets handed off to its own sub-agent. And you're the one who controls how many times that happens. So, when you write your prompt, you say you want to use the skill, and you give it a number along with it. That number is the depth of the tree. So, if you say five, the task gets

**[00:06:05]** broken down five times over and no further. And if you don't give it a number at all, it picks the smallest one that fits what you asked for. Now, the reason it does any of this goes straight back attention problem we just mentioned. When the work is broken up like this, each task has one clear goal, and the agent working on it isn't

**[00:06:22]** carrying the rest of the job around with it. But, those tasks can't be too small, either. The rule the skill gives is that each one should be worth at least 10 minutes of real work, because it has to be a proper piece of the job that an agent can pick up and finish on its own. So, if you set that number too high, and the tasks come out smaller than the 10

**[00:06:39]** minutes of work, the skill lowers the split task to the default number, which is three. And that number also decides how the work runs. Three or under is what the skill calls solo mode, and that's the default. Everything stays in one session, and the same agent works through all of it. But, four and up switches it into orchestrated mode, and

**[00:06:58]** that's where it writes a lot more of it down. It writes a plan file that holds the whole breakdown, and then a separate checklist for every single task in it. And the reason it writes that down in a file comes from how the previous version of this skill failed. That one tried to fix laziness by telling the agent to be thorough. But, an instruction is the

**[00:07:16]** first thing to get lost in a long session, which is the exact problem it was trying to fix. So, this version stopped asking and started putting it in a file before any work begins. That file is the gates file, and it's the ledger we mentioned at the start. And every item in that file is called a gate. So, each gate is a checkbox with an outcome

**[00:07:34]** written next to it, which is one thing that has to be true before the task counts as done. And underneath that outcome, there are three lines. The first is the command that proves that outcome has been achieved. The second is the exact words that command has to give back, and the third is the evidence, which starts out just saying pending.

**[00:07:51]** Then the skill comes with a checker, and when you run it, it goes down that file and runs every one of those commands itself. If the answer that comes back has the words the gate was expecting, it ticks the box, and it replaces that pending line with the bit of the answer that decided it. And that evidence line is what closes the hole in every fix we

**[00:08:09]** listed earlier. A tick box with pending still under it, it means the agent ticked that box itself, which is just the agent telling you it's done all over again. So, it counts as unmet, and the skill treats that as worse than an empty box, because an empty box is at least honest about where the work actually got to. And that same rule is what keeps the

**[00:08:27]** bigger runs honest. In orchestrated mode, it hands one task to a fresh agent, which only gets the plan and its own gates file, nothing about the rest of the job. But when that agent comes back saying it's finished, the main one doesn't take its word for it and runs that task's checks against itself, and only then does it write a line into the

**[00:08:44]** plan file and hand out the next task. And there's an honest way out, because sometimes a task turns out to be impossible. So, instead of the agent dropping it and saying nothing, it writes a line giving up on that gate by name with the reason, and that goes into the report you get at the end. So, Unlazy is a whole system rather than a

**[00:09:01]** single check at the end, and at no point in it does the agent get to decide whether the work is done. Now, to actually [snorts] use the skill, you need to install it first. So, you go to their official GitHub page and look for the install section, and that's where you copy the command from. You can get the link from the description below.

**[00:09:17]** After that, you open the terminal inside the project you're working on and run it. And once you run it, the installer starts, and the first thing it asks is which agent you're using. If you're on Code X, you don't need to change anything there, because it installs into the {dot} agents folder that Code X already reads from. But if you're on

**[00:09:34]** Cloud Code, you select it from the menu that opens. And you can pick as many of the others as you want at the same time. Then it asks you to choose the scope, which is basically whether this skill should only work inside the project you're in right now, or whether you want it available in everything you build. We went with the project scope because we

**[00:09:51]** wanted to test it against one specific project first. After that, you go with the recommended options, and that's the install done. So, when you open that project in VS Code, you'll see two new folders, one called {dot} agents and one called {dot} Claude, and they're not two separate copies of it. The skill itself actually lives in the {dot} agents

**[00:10:08]** folder, and the {dot} Claude one is just a shortcut to it, so that Claude code can also recognize it and use it without having duplicates in the same project. Now, inside that folder, the skill file is the one holding all the guidance for the agent on how to use this. And once that's done, the skill is installed and you're ready to start using it. But

**[00:10:27]** before you do, there's one thing you need to know. If you run this skill exactly as it is, it takes a really long time to get anything meaningful built. We found that out testing it on an app. That session ran for around 3 to 4 hours straight, and when we checked the progress, there was just a login page and nothing else. Since we went through

**[00:10:44]** the skill, we found that the problem was in its instructions. Both Claude code and Codex can run several agents at the same time, and each sub-agent can work in parallel on a different task. But this skill hands out one task, waits for it to complete, and only then hands out the next one. So, even though it was running agents, it was not using these

**[00:11:01]** agents' capabilities to full extent, and that's where all those hours went. So, we opened the project back up and changed the skill itself. And you can pause here and copy the prompt we used if you want to change it yourself. What it does is get the skill to actually use the fact that these tools can run several agents at once. Then to run it,

**[00:11:18]** you type the skill name, then the depth of the tree, and then you write out everything you want built. Since we were building this demo app from scratch, we went with five. But you pick that number based on the size of your own task. If you want to work on a feature rather than a whole app in one go? Two or three would be enough for you. And you don't

**[00:11:35]** have to worry about selecting the wrong option because if you picked higher than needed, it will automatically lower the depth for you. And the first thing it does before it builds anything is writing the plan.md file and then the gates.md file. In the plan.md, it also mentions which task is to work with which file so that if two agents are

**[00:11:53]** working at the same time, they don't overwrite each other's work. Then it lays the foundation and starts handing the work out to the agents all running at the same time. And with those fixes in, 10 agents were working at once, each on different parts of it. That run went for nearly 2 hours. At the end, we got the first version of our demo app

**[00:12:10]** running with all the features working exactly as we wanted. And if you're building at this kind of scale, you can also pair this with a model router skill. That's basically one that sends each task to the right model for it. So, the simple mechanical work goes to a cheaper model and the hard parts go to the strong one so that it doesn't hit

**[00:12:27]** your limits soon. Now, this skill we used here was built through multiple rounds of testing and refining. If you want this skill, you can get that in AI Labs Pro, which is our community. So, if you found value in what we do and want to support the channel, this is the right way to do it. The link's in description. That brings us to the end

**[00:12:42]** of this video. If you'd like to support the channel and help us keep making videos like this, you can do so by using the Super Thanks button below. As always, thank you for watching and I'll see you in the next one.

