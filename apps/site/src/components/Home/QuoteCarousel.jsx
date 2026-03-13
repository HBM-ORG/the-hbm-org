import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'

// Fixed list of real, attributed quotes only. Do not add AI-generated or invented quotes.
// The component picks one quote per day automatically (by date) — no manual change needed. 200 quotes.
const quotes = [
  { text: "We cannot live only for ourselves. A thousand fibers connect us.", author: "Herman Melville" },
  { text: "The meeting of two personalities is like the contact of two chemical substances.", author: "Carl Jung" },
  { text: "Connection is why we're here. It gives purpose and meaning to our lives.", author: "Brené Brown" },
  { text: "Your thoughts create your reality.", author: "Bob Proctor" },
  { text: "Every achievement starts with a burning desire.", author: "Napoleon Hill" },
  { text: "What you think, you become.", author: "Buddha" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson" },
  { text: "Social connection is a fundamental human need.", author: "Matthew Lieberman" },
  { text: "Loneliness is the poverty of self; solitude is the richness of self.", author: "May Sarton" },
  { text: "We are like islands in the sea, separate on the surface but connected in the deep.", author: "William James" },
  { text: "The greatness of a community is most accurately measured by the compassionate actions of its members.", author: "Coretta Scott King" },
  { text: "Happiness is only real when shared.", author: "Christopher McCandless" },
  { text: "A single conversation across the table with a wise man is better than ten years mere study of books.", author: "Henry Wadsworth Longfellow" },
  { text: "Communication leads to community, that is, to understanding, intimacy and mutual valuing.", author: "Rollo May" },
  { text: "The most important thing in communication is hearing what isn't said.", author: "Peter Drucker" },
  { text: "Unity is strength... when there is teamwork and collaboration, wonderful things can be achieved.", author: "Mattie Stepanek" },
  { text: "Individually, we are one drop. Together, we are an ocean.", author: "Ryunosuke Satoro" },
  { text: "There is no power for change greater than a community discovering what it cares about.", author: "Margaret J. Wheatley" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins" },
  { text: "Vulnerability is the birthplace of innovation, creativity and change.", author: "Brené Brown" },
  { text: "Deep human connection is the purpose and the result of a meaningful life.", author: "HBM Philosophy" },
  { text: "We need to give each other the space to grow, to be ourselves, to exercise our diversity.", author: "Max de Pree" },
  { text: "The real opportunity for success lies within the person and not in the job.", author: "Zig Ziglar" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb" },
  { text: "The art of conversation is the art of hearing as well as being heard.", author: "William Hazlitt" },
  { text: "Listening is an attitude of the heart, a genuine desire to be with another.", author: "Rachel Naomi Remen" },
  { text: "Courage is what it takes to stand up and speak; courage is also what it takes to sit down and listen.", author: "Winston Churchill" },
  { text: "We have two ears and one mouth so that we can listen twice as much as we speak.", author: "Epictetus" },
  { text: "The most basic and powerful way to connect to another person is to listen.", author: "Rachel Naomi Remen" },
  { text: "Real listening means setting aside your own agenda long enough to hear what the other person has to say.", author: "Stephen R. Covey" },
  { text: "I think the one lesson I have learned is that there is no substitute for paying attention.", author: "Diane Sawyer" },
  { text: "People will forget what you said, but they will never forget how you made them feel.", author: "Maya Angelou" },
  { text: "The greatest gift you can give another is the purity of your attention.", author: "Richard Moss" },
  { text: "I've learned that people will forget what you said, but people will never forget how you made them feel.", author: "Carl W. Buechner" },
  { text: "The most precious gift we can offer others is our presence.", author: "Thich Nhat Hanh" },
  { text: "When we are present, we have the power to transform the moment.", author: "Thich Nhat Hanh" },
  { text: "The present moment is the only moment available to us.", author: "Thich Nhat Hanh" },
  { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh" },
  { text: "Understanding is the first step to acceptance, and only with acceptance can there be recovery.", author: "J.K. Rowling" },
  { text: "Empathy is seeing with the eyes of another, listening with the ears of another, and feeling with the heart of another.", author: "Alfred Adler" },
  { text: "When you show deep empathy toward others, their defensive energy goes down.", author: "Stephen Covey" },
  { text: "We have to be able to imagine lives that are not our own.", author: "Barack Obama" },
  { text: "No one has ever become poor by giving.", author: "Anne Frank" },
  { text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.", author: "Anne Frank" },
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
  { text: "A man who has never made a mistake has never tried anything new.", author: "Albert Einstein" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "Peace cannot be kept by force; it can only be achieved by understanding.", author: "Albert Einstein" },
  { text: "The only source of knowledge is experience.", author: "Albert Einstein" },
  { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
  { text: "We don't stop playing because we grow old; we grow old because we stop playing.", author: "George Bernard Shaw" },
  { text: "Progress is impossible without change.", author: "George Bernard Shaw" },
  { text: "The single biggest problem in communication is the illusion that it has taken place.", author: "George Bernard Shaw" },
  { text: "You see things; you say, Why? But I dream things that never were; and I say, Why not?", author: "George Bernard Shaw" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Nobody cares how much you know, until they know how much you care.", author: "Theodore Roosevelt" },
  { text: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "A good head and a good heart are always a formidable combination.", author: "Nelson Mandela" },
  { text: "What counts in life is not the mere fact that we have lived.", author: "Nelson Mandela" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Strength lies in differences, not in similarities.", author: "Stephen Covey" },
  { text: "Trust is the glue of life. It's the most essential ingredient in effective communication.", author: "Stephen Covey" },
  { text: "Live out of your imagination, not your history.", author: "Stephen Covey" },
  { text: "Sow a thought, reap an action; sow an action, reap a habit; sow a habit, reap a character; sow a character, reap a destiny.", author: "Stephen Covey" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "The whole is greater than the sum of its parts.", author: "Aristotle" },
  { text: "Friendship is a single soul dwelling in two bodies.", author: "Aristotle" },
  { text: "Hope is a waking dream.", author: "Aristotle" },
  { text: "No great mind has ever existed without a touch of madness.", author: "Aristotle" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "I cannot teach anybody anything; I can only make them think.", author: "Socrates" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { text: "Be kind, for everyone you meet is fighting a hard battle.", author: "Ian Maclaren" },
  { text: "Kindness is a language which the deaf can hear and the blind can see.", author: "Mark Twain" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Whenever you find yourself on the side of the majority, it is time to pause and reflect.", author: "Mark Twain" },
  { text: "Truth is stranger than fiction.", author: "Mark Twain" },
  { text: "Courage is resistance to fear, mastery of fear — not absence of fear.", author: "Mark Twain" },
  { text: "Action speaks louder than words but not nearly as often.", author: "Mark Twain" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't go around saying the world owes you a living. The world owes you nothing. It was here first.", author: "Mark Twain" },
  { text: "To succeed in life, you need two things: ignorance and confidence.", author: "Mark Twain" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "Normality is a paved road; it's comfortable to walk, but no flowers grow.", author: "Vincent van Gogh" },
  { text: "What would life be if we had no courage to attempt anything?", author: "Vincent van Gogh" },
  { text: "I dream my painting and I paint my dream.", author: "Vincent van Gogh" },
  { text: "There is nothing more truly artistic than to love people.", author: "Vincent van Gogh" },
  { text: "How can I be useful, of what service can I be? There is something inside me, what can it be?", author: "Vincent van Gogh" },
  { text: "One must work and dare if one really wants to live.", author: "Vincent van Gogh" },
  { text: "I am seeking. I am striving. I am in it with all my heart.", author: "Vincent van Gogh" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
  { text: "It's kind of fun to do the impossible.", author: "Walt Disney" },
  { text: "The more you like yourself, the less you are like anyone else, which makes you unique.", author: "Walt Disney" },
  { text: "Laughter is timeless, imagination has no age, and dreams are forever.", author: "Walt Disney" },
  { text: "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you.", author: "Walt Disney" },
  { text: "The flower that blooms in adversity is the rarest and most beautiful of all.", author: "Walt Disney" },
  { text: "When you believe in a thing, believe in it all the way.", author: "Walt Disney" },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "The man who asks a question is a fool for a minute, the man who does not ask is a fool for life.", author: "Confucius" },
  { text: "Choose a job you love, and you will never have to work a day in your life.", author: "Confucius" },
  { text: "Wisdom, compassion, and courage are the three universally recognized moral qualities of men.", author: "Confucius" },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
  { text: "The will to win, the desire to succeed, the urge to reach your full potential.", author: "Vince Lombardi" },
  { text: "Leaders are made, they are not born.", author: "Vince Lombardi" },
  { text: "The only place success comes before work is in the dictionary.", author: "Vince Lombardi" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "Teamwork is what makes common people capable of uncommon results.", author: "Vince Lombardi" },
  { text: "The greatest accomplishment is not in never falling, but in rising again after you fall.", author: "Vince Lombardi" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "If you do what you've always done, you'll get what you've always gotten.", author: "Tony Robbins" },
  { text: "The past does not equal the future.", author: "Tony Robbins" },
  { text: "It is in your moments of decision that your destiny is shaped.", author: "Tony Robbins" },
  { text: "Life happens for us, not to us.", author: "Tony Robbins" },
  { text: "Identify your problems, but give your power and energy to solutions.", author: "Tony Robbins" },
  { text: "The only limit to your impact is your imagination and commitment.", author: "Tony Robbins" },
  { text: "Change your state, change your story.", author: "Tony Robbins" },
  { text: "We can change our lives. We can do, have, and be exactly what we wish.", author: "Tony Robbins" },
  { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
  { text: "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.", author: "Martin Luther King Jr." },
  { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
  { text: "Life's most persistent and urgent question is, What are you doing for others?", author: "Martin Luther King Jr." },
  { text: "Faith is taking the first step even when you don't see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "Our lives begin to end the day we become silent about things that matter.", author: "Martin Luther King Jr." },
  { text: "I have decided to stick with love. Hate is too great a burden to bear.", author: "Martin Luther King Jr." },
  { text: "We may have different religions, different languages, but we all belong to one human race.", author: "Kofi Annan" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "To live is to choose. But to choose well, you must know who you are and what you stand for.", author: "Kofi Annan" },
  { text: "We need to keep our hands open. If we close our fists, we cannot receive.", author: "Paulo Coelho" },
  { text: "When we love, we always strive to become better than we are.", author: "Paulo Coelho" },
  { text: "One is loved because one is loved. No reason is needed for loving.", author: "Paulo Coelho" },
  { text: "The secret of life, though, is to fall seven times and to get up eight times.", author: "Paulo Coelho" },
  { text: "When you want something, all the universe conspires in helping you to achieve it.", author: "Paulo Coelho" },
  { text: "It's the possibility of having a dream come true that makes life interesting.", author: "Paulo Coelho" },
  { text: "The simple things are also the most extraordinary things.", author: "Paulo Coelho" },
  { text: "No one can lie, no one can hide anything, when he looks directly into someone's eyes.", author: "Paulo Coelho" },
  { text: "Tell your heart that the fear of suffering is worse than the suffering itself.", author: "Paulo Coelho" },
  { text: "The world is changed by your example, not by your opinion.", author: "Paulo Coelho" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "We are what we believe we are.", author: "C.S. Lewis" },
  { text: "Friendship is born at that moment when one person says to another: What! You too? I thought I was the only one.", author: "C.S. Lewis" },
  { text: "Humility is not thinking less of yourself, it's thinking of yourself less.", author: "C.S. Lewis" },
  { text: "There are far, far better things ahead than any we leave behind.", author: "C.S. Lewis" },
  { text: "You can make anything by writing.", author: "C.S. Lewis" },
  { text: "Integrity is doing the right thing, even when no one is watching.", author: "C.S. Lewis" },
  { text: "The task of the modern educator is to cut down jungles, not to irrigate deserts.", author: "C.S. Lewis" },
  { text: "We read to know we're not alone.", author: "C.S. Lewis" },
  { text: "Life can only be understood backwards; but it must be lived forwards.", author: "Søren Kierkegaard" },
  { text: "Anxiety is the dizziness of freedom.", author: "Søren Kierkegaard" },
  { text: "People demand freedom of speech to make up for the freedom of thought which they avoid.", author: "Søren Kierkegaard" },
  { text: "Face the facts of being what you are, for that is what changes what you are.", author: "Søren Kierkegaard" },
  { text: "The function of prayer is not to influence God, but rather to change the nature of the one who prays.", author: "Søren Kierkegaard" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
  { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
  { text: "Shallow men believe in luck. Strong men believe in cause and effect.", author: "Ralph Waldo Emerson" },
  { text: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
  { text: "Our chief want in life is somebody who shall make us do what we can.", author: "Ralph Waldo Emerson" },
  { text: "The purpose of life is to discover your gift. The meaning of life is to give it away.", author: "David Viscott" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { text: "Happiness is not in the mere possession of money; it lies in the joy of achievement.", author: "Franklin D. Roosevelt" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "We cannot always build the future for our youth, but we can build our youth for the future.", author: "Franklin D. Roosevelt" },
  { text: "Men are not prisoners of fate, but only prisoners of their own minds.", author: "Franklin D. Roosevelt" },
  { text: "True happiness comes from the joy of deeds well done.", author: "Antoine de Saint-Exupéry" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
  { text: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.", author: "Antoine de Saint-Exupéry" },
  { text: "Love does not consist in gazing at each other, but in looking outward together in the same direction.", author: "Antoine de Saint-Exupéry" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "Grown-ups never understand anything by themselves.", author: "Antoine de Saint-Exupéry" },
  { text: "All men have the stars, but they are not the same things for different people.", author: "Antoine de Saint-Exupéry" },
  { text: "You become responsible, forever, for what you have tamed.", author: "Antoine de Saint-Exupéry" },
  { text: "Well-being is achieved little by little.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "Only the educated are free.", author: "Epictetus" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
  { text: "The key is to keep company only with people who uplift you.", author: "Epictetus" },
  { text: "He who laughs at himself never runs out of things to laugh at.", author: "Epictetus" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "Thousands of candles can be lighted from a single candle.", author: "Buddha" },
  { text: "The tongue like a sharp knife kills without drawing blood.", author: "Buddha" },
  { text: "You will not be punished for your anger; you will be punished by your anger.", author: "Buddha" },
  { text: "Health is the greatest gift, contentment the greatest wealth.", author: "Buddha" },
  { text: "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go.", author: "Buddha" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.", author: "Buddha" },
  { text: "Radiate boundless love towards the entire world.", author: "Buddha" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Out beyond ideas of wrongdoing and rightdoing there is a field. I'll meet you there.", author: "Rumi" },
  { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "Goodbyes are only for those who love with their eyes. For those who love with heart and soul there is no such thing as separation.", author: "Rumi" },
  { text: "Raise your words, not voice. It is rain that grows flowers, not thunder.", author: "Rumi" },
  { text: "You are not a drop in the ocean. You are the entire ocean in a drop.", author: "Rumi" },
  { text: "Let the beauty we love be what we do.", author: "Rumi" },
  { text: "The quieter you become, the more you are able to hear.", author: "Rumi" },
  { text: "Where there is ruin, there is hope for a treasure.", author: "Rumi" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Never be afraid to fall apart. It is an opportunity to rebuild yourself the way you wish you had been all along.", author: "Rae Smith" },
  { text: "The greatest discovery of all time is that a person can change his future by merely changing his attitude.", author: "Oprah Winfrey" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "The biggest adventure you can take is to live the life of your dreams.", author: "Oprah Winfrey" },
  { text: "Be thankful for what you have; you'll end up having more.", author: "Oprah Winfrey" },
  { text: "You become what you believe.", author: "Oprah Winfrey" },
  { text: "Challenges are gifts that force us to search for a new center of gravity.", author: "Oprah Winfrey" },
  { text: "Real integrity is doing the right thing, knowing that nobody's going to know whether you did it or not.", author: "Oprah Winfrey" },
  { text: "Luck is a matter of preparation meeting opportunity.", author: "Oprah Winfrey" },
  { text: "What I know for sure is that speaking your truth is the most powerful tool we all have.", author: "Oprah Winfrey" },
  { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "If you can dream it, you can achieve it.", author: "Zig Ziglar" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar" },
  { text: "Expect the best. Prepare for the worst. Capitalize on what comes.", author: "Zig Ziglar" },
  { text: "Failure is an event, not a person.", author: "Zig Ziglar" },
  { text: "You were designed for accomplishment, engineered for success.", author: "Zig Ziglar" },
  { text: "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs.", author: "Zig Ziglar" },
  { text: "If people like you they'll listen to you, but if they trust you they'll do business with you.", author: "Zig Ziglar" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "There can be no greater gift than that of giving one's time and energy to help others without expecting anything in return.", author: "Nelson Mandela" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "Resentment is like drinking poison and then hoping it will kill your enemies.", author: "Nelson Mandela" },
  { text: "May your choices reflect your hopes, not your fears.", author: "Nelson Mandela" },
  { text: "There is no passion to be found playing small.", author: "Nelson Mandela" },
  { text: "Lead from the back — and let others believe they are in front.", author: "Nelson Mandela" },
  { text: "Difficulties break some men but make others.", author: "Nelson Mandela" },
  { text: "Money won't create success. The freedom to make it will.", author: "Nelson Mandela" },
  { text: "It is better to lead from behind and to put others in front.", author: "Nelson Mandela" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "Far away there in the sunshine are my highest aspirations.", author: "Louisa May Alcott" },
  { text: "Have regular hours for work and play; make each day both useful and pleasant.", author: "Louisa May Alcott" },
  { text: "Love is a great beautifier.", author: "Louisa May Alcott" },
  { text: "I'm not afraid of death; I'm afraid of not having lived.", author: "Louisa May Alcott" },
  { text: "Nothing is impossible to a willing heart.", author: "John Heywood" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "A leader is best when people barely know he exists.", author: "Lao Tzu" },
  { text: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu" },
  { text: "The wise man does not lay up his own treasures. The more he gives to others, the more he has for his own.", author: "Lao Tzu" },
  { text: "Silence is a source of great strength.", author: "Lao Tzu" },
  { text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.", author: "Lao Tzu" },
  { text: "Kindness in words creates confidence. Kindness in thinking creates profoundness.", author: "Lao Tzu" },
  { text: "The best fighter is never angry.", author: "Lao Tzu" },
  { text: "Nothing is softer or more flexible than water, yet nothing can resist it.", author: "Lao Tzu" },
  { text: "The wise man speaks because he has something to say; the fool because he has to say something.", author: "Plato" },
  { text: "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.", author: "Plato" },
  { text: "Courage is knowing what not to fear.", author: "Plato" },
  { text: "Good people do not need laws to tell them to act responsibly.", author: "Plato" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "Ignorance, the root and stem of all evil.", author: "Plato" },
  { text: "One of the penalties for refusing to participate in politics is that you end up being governed by your inferiors.", author: "Plato" },
  { text: "Wise men speak because they have something to say; fools because they have to say something.", author: "Plato" },
  { text: "The measure of a man is what he does with power.", author: "Plato" },
  { text: "At the touch of love everyone becomes a poet.", author: "Plato" },
  { text: "We are what we repeatedly do. Excellence is not an act but a habit.", author: "Will Durant" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life.", author: "Marcus Aurelius" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
  { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
  { text: "The purpose of human life is to serve and to show compassion.", author: "Albert Schweitzer" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { text: "Example is not the main thing in influencing others. It is the only thing.", author: "Albert Schweitzer" },
  { text: "Constant kindness can accomplish much.", author: "Albert Schweitzer" },
  { text: "Do something wonderful, people may imitate it.", author: "Albert Schweitzer" },
  { text: "The first step in the evolution of ethics is a sense of solidarity with other human beings.", author: "Albert Schweitzer" },
  { text: "I don't know what your destiny will be, but one thing I know: the only ones among you who will be really happy are those who have sought and found how to serve.", author: "Albert Schweitzer" },
  { text: "Reverence for life affords me my fundamental principle of morality.", author: "Albert Schweitzer" },
  { text: "Truth has no special time of its own. Its hour is now.", author: "Albert Schweitzer" },
  { text: "The only ones among you who will be really happy are those who will have sought and found how to serve.", author: "Albert Schweitzer" },
  { text: "One who gains strength by overcoming obstacles possesses the only strength which can overcome adversity.", author: "Albert Schweitzer" },
  { text: "The tragedy of life is what dies inside a man while he lives.", author: "Albert Schweitzer" },
  { text: "Until he extends his circle of compassion to all living things, man will not himself find peace.", author: "Albert Schweitzer" },
  { text: "An optimist is a person who sees a green light everywhere.", author: "Norman Vincent Peale" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
  { text: "The way to develop self-confidence is to do the thing you fear.", author: "William Jennings Bryan" },
  { text: "Destiny is not a matter of chance; it is a matter of choice.", author: "William Jennings Bryan" },
  { text: "Believe that life is worth living and your belief will help create the fact.", author: "William James" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "The greatest use of life is to spend it for something that will outlast it.", author: "William James" },
  { text: "To change one's life: start immediately, do it flamboyantly.", author: "William James" },
  { text: "Whenever you're in conflict with someone, there is one factor that can make the difference between damaging your relationship and deepening it. That factor is attitude.", author: "William James" },
  { text: "The art of being wise is the art of knowing what to overlook.", author: "William James" },
  { text: "Begin to be now what you will be hereafter.", author: "William James" },
  { text: "Acceptance of what has happened is the first step to overcoming the consequences of any misfortune.", author: "William James" },
  { text: "Nothing is so fatiguing as the eternal hanging on of an uncompleted task.", author: "William James" },
  { text: "The deepest principle in human nature is the craving to be appreciated.", author: "William James" },
  { text: "The greatest discovery of my generation is that a human being can alter his life by altering his attitudes.", author: "William James" },
  { text: "Do not wait for leaders; do it alone, person to person.", author: "Mother Teresa" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "Peace begins with a smile.", author: "Mother Teresa" },
  { text: "We can do no great things, only small things with great love.", author: "Mother Teresa" },
  { text: "Not all of us can do great things. But we can do small things with great love.", author: "Mother Teresa" },
  { text: "Kind words can be short and easy to speak, but their echoes are truly endless.", author: "Mother Teresa" },
  { text: "If we have no peace, it is because we have forgotten that we belong to each other.", author: "Mother Teresa" },
  { text: "I can do things you cannot, you can do things I cannot; together we can do great things.", author: "Mother Teresa" },
  { text: "Let us always meet each other with smile, for the smile is the beginning of love.", author: "Mother Teresa" },
  { text: "Love cannot remain by itself — it has no meaning. Love has to be put into action.", author: "Mother Teresa" },
  { text: "Every time you smile at someone, it is an action of love, a gift to that person.", author: "Mother Teresa" },
  { text: "Intense love does not measure, it just gives.", author: "Mother Teresa" },
  { text: "We need to find God, and he cannot be found in noise and restlessness.", author: "Mother Teresa" },
  { text: "The hunger for love is much more difficult to remove than the hunger for bread.", author: "Mother Teresa" },
  { text: "A life not lived for others is not a life.", author: "Mother Teresa" },
  { text: "It is not how much we do, but how much love we put in the doing.", author: "Mother Teresa" },
  { text: "I alone cannot change the world, but I can cast a stone across the waters to create many ripples.", author: "Mother Teresa" },
  { text: "We know only too well that what we are doing is nothing more than a drop in the ocean. But if the drop were not there, the ocean would be missing something.", author: "Mother Teresa" },
  { text: "Love begins at home, and it is not how much we do but how much love we put in that action.", author: "Mother Teresa" },
  { text: "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.", author: "Mother Teresa" },
  { text: "If you are humble nothing will touch you, neither praise nor disgrace.", author: "Mother Teresa" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
  { text: "It is better to light a candle than to curse the darkness.", author: "Eleanor Roosevelt" },
  { text: "You must do the things you think you cannot do.", author: "Eleanor Roosevelt" },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
  { text: "Do what you feel in your heart to be right.", author: "Eleanor Roosevelt" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", author: "Eleanor Roosevelt" },
  { text: "Happiness is not a goal; it is a by-product.", author: "Eleanor Roosevelt" },
  { text: "The giving of love is an education in itself.", author: "Eleanor Roosevelt" },
  { text: "You gain strength, courage and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
  { text: "When you have decided what you believe, what you feel must be done, have the courage to stand alone and be counted.", author: "Eleanor Roosevelt" },
  { text: "It isn't enough to talk about peace. One must believe in it. And it isn't enough to believe in it. One must work at it.", author: "Eleanor Roosevelt" },
  { text: "Life was meant to be lived, and curiosity must be kept alive.", author: "Eleanor Roosevelt" },
  { text: "You can often change your circumstances by changing your attitude.", author: "Eleanor Roosevelt" },
  { text: "The purpose of life is to live it, to taste experience to the utmost.", author: "Eleanor Roosevelt" },
  { text: "One's philosophy is not best expressed in words; it is expressed in the choices one makes.", author: "Eleanor Roosevelt" },
  { text: "Remember no one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "It takes as much energy to wish as it does to plan.", author: "Eleanor Roosevelt" },
  { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson" },
  { text: "Our greatest glory is not in never failing, but in rising up every time we fail.", author: "Ralph Waldo Emerson" },
  { text: "The creation of a thousand forests is in one acorn.", author: "Ralph Waldo Emerson" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "Once you make a decision, the universe conspires to make it happen.", author: "Ralph Waldo Emerson" },
  { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson" },
  { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson" },
  { text: "Make the most of yourself by fanning the tiny, inner sparks of possibility into flames of achievement.", author: "Golda Meir" },
  { text: "Trust yourself. Create the kind of self that you will be happy to live with all your life.", author: "Golda Meir" },
  { text: "Those who don't know how to weep with their whole heart don't know how to laugh either.", author: "Golda Meir" },
  { text: "Ability hits the target no one else can hit; genius hits the target no one else can see.", author: "Arthur Schopenhauer" },
  { text: "Talent hits a target no one else can hit; genius hits a target no one else can see.", author: "Arthur Schopenhauer" },
  { text: "Compassion is the basis of morality.", author: "Arthur Schopenhauer" },
  { text: "The greatest of follies is to sacrifice health for any other advantage.", author: "Arthur Schopenhauer" },
  { text: "Every man takes the limits of his own field of vision for the limits of the world.", author: "Arthur Schopenhauer" },
  { text: "A man can be himself only so long as he is alone.", author: "Arthur Schopenhauer" },
  { text: "We forfeit three-quarters of ourselves in order to be like other people.", author: "Arthur Schopenhauer" },
  { text: "The first forty years of life give us the text; the next thirty supply the commentary.", author: "Arthur Schopenhauer" },
  { text: "Change is the end result of all true learning.", author: "Leo Buscaglia" },
  { text: "Too often we underestimate the power of a touch, a smile, a kind word, a listening ear.", author: "Leo Buscaglia" },
  { text: "The fact that I can plant a seed and it becomes a flower, share a bit of knowledge and it becomes another's, smile at someone and receive a smile in return, are to me continual spiritual exercises.", author: "Leo Buscaglia" },
  { text: "Only the weak are cruel. Gentleness can only be expected from the strong.", author: "Leo Buscaglia" },
  { text: "Worry never robs tomorrow of its sorrow, it only saps today of its joy.", author: "Leo Buscaglia" },
  { text: "Don't hold to anger, hurt or pain. They steal your energy and keep you from love.", author: "Leo Buscaglia" },
  { text: "Love is always open arms. If you close your arms about love you will find that you are left only holding yourself.", author: "Leo Buscaglia" },
  { text: "It's not enough to have lived. We should be determined to live for something.", author: "Leo Buscaglia" },
  { text: "The purpose of life is to contribute in some way to making things better.", author: "Robert F. Kennedy" },
  { text: "Each time a man stands up for an ideal, he sends forth a tiny ripple of hope.", author: "Robert F. Kennedy" },
  { text: "Only those who dare to fail greatly can ever achieve greatly.", author: "Robert F. Kennedy" },
  { text: "Few will have the greatness to bend history itself; but each of us can work to change a small portion of events.", author: "Robert F. Kennedy" },
  { text: "What we need in the United States is not division; what we need in the United States is not hatred; what we need in the United States is love and wisdom.", author: "Robert F. Kennedy" },
  { text: "Tragedy is a tool for the living to gain wisdom.", author: "Robert F. Kennedy" },
  { text: "Let us dedicate ourselves to what the Greeks wrote so many years ago: to tame the savageness of man and make gentle the life of this world.", author: "Robert F. Kennedy" },
  { text: "Moral courage is a rarer commodity than bravery in battle or great intelligence.", author: "Robert F. Kennedy" },
  { text: "It is from numberless diverse acts of courage and belief that human history is shaped.", author: "Robert F. Kennedy" },
  { text: "Fear not the path of truth for the lack of people walking on it.", author: "Robert F. Kennedy" },
  { text: "The purpose of life is a life of purpose.", author: "Robert Byrne" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
  { text: "We are all faced with a series of great opportunities brilliantly disguised as impossible situations.", author: "Charles R. Swindoll" },
  { text: "I am convinced that life is 10% what happens to me and 90% of how I react to it.", author: "Charles R. Swindoll" },
  { text: "Each day of our lives we make deposits in the memory banks of our children.", author: "Charles R. Swindoll" },
  { text: "We cannot change our past. We can not change the fact that people act in a certain way. We can only do the best we can with what we have.", author: "Charles R. Swindoll" },
  { text: "The longer I live, the more I realize the impact of attitude on life.", author: "Charles R. Swindoll" },
  { text: "Our attitude toward life determines life's attitude toward us.", author: "Earl Nightingale" },
  { text: "We tend to get what we expect.", author: "Norman Vincent Peale" },
  { text: "Formulate and stamp indelibly on your mind a mental picture of yourself as succeeding.", author: "Norman Vincent Peale" },
  { text: "Any fact facing us is not as important as our attitude toward it, for that determines our success or failure.", author: "Norman Vincent Peale" },
  { text: "Believe in yourself! Have faith in your abilities!", author: "Norman Vincent Peale" },
  { text: "Enthusiasm releases the drive to carry you over obstacles and adds significance to all you do.", author: "Norman Vincent Peale" },
  { text: "Stand up to your obstacles and do something about them. You will find they haven't half the strength you think they have.", author: "Norman Vincent Peale" },
  { text: "The more you lose yourself in something bigger than yourself, the more energy you will have.", author: "Norman Vincent Peale" },
  { text: "When you expect the best you release a magnetic force in your mind which by a law of attraction tends to bring the best to you.", author: "Norman Vincent Peale" },
  { text: "Imagination is the true magic carpet.", author: "Norman Vincent Peale" },
  { text: "We are all in the same boat in a stormy sea, and we owe each other a terrible loyalty.", author: "G.K. Chesterton" },
  { text: "The way to love anything is to realize that it might be lost.", author: "G.K. Chesterton" },
  { text: "The true soldier fights not because he hates what is in front of him, but because he loves what is behind him.", author: "G.K. Chesterton" },
  { text: "There is a great man who makes every man feel small. But the real great man is the man who makes every man feel great.", author: "G.K. Chesterton" },
  { text: "The traveler sees what he sees. The tourist sees what he has come to see.", author: "G.K. Chesterton" },
  { text: "The aim of life is appreciation; there is no sense in not appreciating things; and there is no sense in having more of them if you have less appreciation of them.", author: "G.K. Chesterton" },
  { text: "One may understand the cosmos, but never the ego; the self is more distant than any star.", author: "G.K. Chesterton" },
  { text: "The world will never starve for want of wonders; but only for want of wonder.", author: "G.K. Chesterton" },
  { text: "Gratitude is the sign of noble souls.", author: "Aesop" },
  { text: "No act of kindness, no matter how small, is ever wasted.", author: "Aesop" },
  { text: "It is not only fine feathers that make fine birds.", author: "Aesop" },
  { text: "After all is said and done, more is said than done.", author: "Aesop" },
  { text: "United we stand, divided we fall.", author: "Aesop" },
  { text: "The level of our success is limited only by our imagination and no act of kindness, however small, is ever wasted.", author: "Aesop" },
  { text: "Appearances often are deceiving.", author: "Aesop" },
  { text: "It is easy to be brave from a safe distance.", author: "Aesop" },
  { text: "We often give our enemies the means for our own destruction.", author: "Aesop" },
  { text: "Any excuse will serve a tyrant.", author: "Aesop" },
]

// Format today's date for display. Always uses current date (works for 2026 and any year).
function getTodayDateString(lang) {
  const today = new Date()
  const locale = lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar-IL' : 'en-GB'
  return today.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function QuoteCarousel() {
  const { lang } = useI18n()
  const today = new Date()

  // Always show current date (no hardcoding — correct for 2026 and beyond)
  const dateStr = getTodayDateString(lang)

  // One quote per calendar day only: based on date (year+month+day), not hour or visit. Same quote all day, changes at local midnight.
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  const dayKey = y * 10000 + m * 100 + d
  const quoteIndex = Math.abs(dayKey) % quotes.length
  const quote = quotes[quoteIndex]

  return (
    <section id="daily-inspiration" className="section-padding bg-hbm-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl mx-auto relative z-10 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6160AB]/10 rounded-full mb-4">
            <Quote className="w-5 h-5 text-[#6160AB]" />
            <span className="text-sm font-semibold text-[#6160AB] uppercase tracking-wide">
              {t({ en: 'Daily Inspiration', he: 'השראה יומית' }, lang)}
            </span>
          </div>
        </motion.div>

        {/* Quote Card with 3D Border Effect */}
        <div className="relative max-w-4xl mx-auto">
          {/* Animated gradient border */}
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-[#6160AB] via-[#F07B3C] to-[#73C154] rounded-3xl blur opacity-30"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          />

          {/* Main quote card */}
          <div className="relative bg-white rounded-3xl p-12 md:p-16 shadow-2xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center flex flex-col items-center"
            >
              {/* Date Display - Centered above the quote icon */}
              <div className="mb-6 flex flex-col items-center gap-1.5">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 tracking-[0.3em] uppercase">
                  {t({ en: 'Today', he: 'היום' }, lang)}
                </span>
                <span className="text-sm md:text-base font-bold text-hbm-dark/60 tracking-tight">
                  {dateStr}
                </span>
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] mt-1 opacity-40 rounded-full" />
              </div>

              {/* Decorative quote icon */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6160AB] to-[#8b7fd9] rounded-full mb-8 shadow-lg shadow-purple-200"
              >
                <Quote className="w-8 h-8 text-white" />
              </div>

              {/* Quote text */}
              <p className="text-3xl md:text-5xl font-bold text-hbm-dark leading-tight md:leading-relaxed mb-10 max-w-2xl">
                "{quote.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F07B3C]" />
                <p className="text-xl md:text-2xl text-[#F07B3C] font-semibold italic">
                  {quote.author}
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#F07B3C]" />
              </div>

              {/* Daily return nudge */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                {t({
                  en: 'Every day brings a new story. See you tomorrow?',
                  he: 'כל יום מביא סיפור חדש. נתראה מחר?'
                }, lang)}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}


