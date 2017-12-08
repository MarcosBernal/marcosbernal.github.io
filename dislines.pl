#!/usr/bin/perl -w
#
# dislines: distribute in several files the lines of a tagged text.
# Version 1.6  (c) 12-7 to 9-8-2005  Daniel Clemente Laboreo
# http://www.danielclemente.com/dislines/
my $VERSION="1.6";
#
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
#
#
# Super-quick syntax guide:
# (full syntax at): http://www.danielclemente.com/dislines/syntax.en.html
# 
# Simple: @tag
# Multiple: @tag1,tag2,tag3
# Blocks: open with @{tag or @tag{  and close them with @}tag @tag} or @}
# Comments: @-----    or in a block. Any number of -
# Repeat last tag used: @"""""""     Any number of "
# You can use a lot of @ if you want: @@@@@@@@tag
# Common lines can also have it: @@ This is common
#
#
#
#
# The idea for the program is: 
#
# 1. Create a temporary file for the common lines
# 2. For every line of the file:
# 3. | If it's common (no tag), add it to the global file created in (1)
# 4. | If it has a tag or more attached, do for each tag:
# 5. | | If it's the first time we see this tag:
# 6. | | | Duplicate the global file to make a temporary file for this tag
# 7. | | Add the line to the temporary file of the tag
# 8. | Also add the line to the global file
# 9. Now turn the temporary files into the final ones and delete the global
#
#

# use v5.0; # or 5.005_03 or later

use strict;
# use warnings; # Not on <v5.6.0.  I'm using -w

use Getopt::Long;
use File::Copy;
use File::Basename;
# and File::Temp if available


# 
# Customizable settings:
# 

# Change to 1 to better understand the code:
my $DEBUG=0;

# How to separate the "TAG" from the "file" in "file.TAG.ext"
my $SEP_CHAR='.'; # file.TAG.ext
# my $SEP_CHAR='-'; # file-TAG.ext   (eg. index-en.html)

# If you don't like ats (@), you can change the used symbol here.
# Of course, you must put the one you use in your files.
my $AT='@';
# my $AT='\s*@';  # Use this if you accept spaces before the @


# Other global variables:
# It's better to use our(...) here, but 'our' is only for >=5.6.0
use vars (
           '$input_file',

           '%file',      # For each tag, it has its associated file handler
                         # tag "" means common text
           '%lines',     # For stats: for each tag, how many lines has the file 
                         # tag "" means common text
                         # tag "-" means comment text
           
           # Options from the command line
           qw( $just_list $only_tags $out_base $just_stats
           $show_help $show_version $quiet )
         );


# No options on the command line ===> open graphical user interface
if (not @ARGV) {

	#   Load the Tk module, or complain if you don't have it
   
	eval "require Tk;" or do {
		my $error="\n  To open the graphical interface, ".
		"you need to install the perl-Tk package.\n".
		"You can still use the command line options; ".
		"try: perl $0 -h\n";

		system(qq!Xdialog --title "Error: no perl-Tk" --msgbox "$error" 0 0!)==0
			or print STDERR $error;
		die "\n";
	};

	
	# and Tk::LabFrame, which in fact isn't really important (but nice to have)
		
	eval "require Tk::LabFrame" or die "  You don't have the Tk widget called 'LabFrame'. ".
	"It's strange, since normally it comes with perl-Tk.\n".
	"Tell me about your operating system and I will try to improve this.\n".
	"For the moment, you can still the use the command line options; ".
	"try: perl $0 -h\n";
	
	
	# Tk found
	print "I'm opening the GUI. If you want to use the command line, see -h\n";


	# The main window, and the 'Advanced options' window.
	my ($MainW, $AdvW);
	
	$MainW = MainWindow -> new(-title=>'dislines');


	my $action_sel=''; # '' or '--list' or '--stats'
		

	# Variables for the important widgets
	my ($w_frame, $w_text);

	# Widgets: title: 'dislines', and the version
	$MainW->Label (
		-text => 'dislines',
	        -anchor => 'c',
		-fg => 'orange',
		-font => 'utopia -26 bold',
        )->pack();
	$MainW->Label (
		-text => "v$VERSION",
	)->pack();
	
	# Widgets: the file chooser for the input file
	$MainW->Label (
		-text => 'File to process:',
		-width=>60,
		-anchor=>'w',
	)->pack();
	
	$w_frame = $MainW->Frame ()->pack();
	
	$w_frame->Entry (
		-width => 50,
		-textvariable => \$input_file,
	)->pack(
		-side=>'left',
	);
	$w_frame->Button (
		-text => 'Browse',
		-command => sub {

			my $selected=$MainW->getOpenFile(
				-filetypes=>[
				['All files',      '*'                ],
				['Text files',     '.txt'             ],
				['Web pages',      ['.html','.xhtml'] ],
				['txt2tags files', '.t2t'             ],
				]
			);
			$input_file = $selected || $input_file;
			
			# A new file has been selected. Replace settings.
			$out_base=$input_file if $selected;

			# Furthermore, we keep the last used value for these settings:
			# - action to do (process or list or stats)
			# - separator to use at the file names
			# - only tags that we have to process
			#
			#   I think that this can be useful to someone who's trying to
			# do a species of "batch" processing with several files.
		},
		-underline => 0,
	)->pack(
		-side=>'left',
	);


	# Widgets: the information window (also used for the output)
	$w_text = $MainW->Text (
	       -relief=>'solid',
	       -wrap=>'word',
	       -height=>7,
	       -width=>60,
	)->pack();

	$w_text->tagConfigure('link', -foreground => 'blue', -underline => 1);
	$w_text->tagConfigure('code', -foreground => '#1c1');

	$w_text->insert('end',
		"\n   For every tag you used in your file, a file named ", 'normal',
		"file.{TAG}.ext", 'code',
		" will be created in the same directory, where ", 'normal',
		"{TAG}", 'code',
		" is the real tag, and assuming that ", 'normal',
	        "file.ext", 'code',
		" is the name of the input file.\n   More info at ", 'normal',
		"http://www.danielclemente.com/dislines/",'link',
		"\n", 'normal');
	$w_text->configure(-state=>'disabled');
	
	

	# Widgets: the 3 buttons: PROCESS, Advanced options, Exit
	 
	$w_frame = $MainW->Frame ()->pack(-pady=>5,);
		
	$w_frame->Button (
		-text=>'PROCESS',
		-command => sub {
			return if not $input_file;

			#   The application may have been started from any directory
			# (since the user may have clicked some fancy icon in a file
			# browser). We don't want to create the files there; it should
			# be better in the same directory where the input file is.
			my $out_topass=$out_base;
			$out_topass ||= $input_file;
			my $only_tags_topass = '';
			$only_tags_topass="--tags=$only_tags" if $only_tags;
			
			my $ret_info;
			# Call the program
			$ret_info=&dislines(
				$input_file,
				'--out' => $out_topass,
				$action_sel,       # '' or '--list' or '--stats'
				$only_tags_topass, # '' or '--tags=es,it'...
			) || $@;

			# We're going to write the results into the Label
			$w_text->configure(-state=>'normal');   # Be able to change it
			$w_text->delete('0.0','end');           # Delete everything
			$w_text->insert('end', $ret_info);      # Write the text

			# Now we'll write a message indicating whether there were errors
			$w_text->tagConfigure('ok', -foreground => 'white', -background => '#1c1');
			$w_text->tagConfigure('error', -foreground => 'white', -background => 'red');

			if ($@) {
				$w_text->insert('end','There were errors','error');
			} else {
				$w_text->insert('end','Operation completed with no problems','ok');
			}
			$w_text->configure(-state=>'disabled');
			# The Label is blocked again (not editable)
			
			if ($DEBUG) {
				print "Finished. I put into the GUI this information:\n$ret_info";
			}
			

		},
	)->pack(
		-side=>'left',
	);
	
	
	$w_frame->Button (
		-text=>'Advanced options',
		-command => \&advanced_options,
		
	)->pack(
		-side=>'left',
	);
	
	
	$w_frame->Button (
		-text=>'Exit',
		-command => sub {
			$MainW->destroy;
			#   exit() does a Segmentation Fault on my v5.8.6 if I use
			# "require Tk" instead of "use Tk". I don't know why.
			#exit 0;
	       },
	)->pack(
		-side=>'left',
	);

	# Show the window with the not-so-simple settings
	sub advanced_options () {

		if ($AdvW){
			if ($DEBUG) {print "That window already was opened\n";}
			# This sometimes failed; review:  #  $AdvW->focus;
			return;
		}
		

		# Backup the current settings to be able to restore them if you click Cancel
		my @advanced_options = (
			$action_sel, $out_base, $SEP_CHAR, $only_tags,
		); 
		
		
		my ($w_frame_output, $w_frame_tags); # and also $w_frame
			
		# Create the window
		$AdvW=$MainW->Toplevel(-title=>'dislines: Advanced options');
		
		
		# Title
		$AdvW->Label(-text=>'Advanced options',	)->pack(-pady=>6,);


		# Frame 1: 'Action'. 3 options.
		$w_frame=$AdvW->LabFrame(-label=>'Action',)->pack();

		$w_frame->Radiobutton(
			-text=>'Process the file',
			-variable=>\$action_sel,
			-value=>'',
			-width=>57, -anchor=>'w',
		)->pack();
		$w_frame->Radiobutton(
			-text=>'Just list the used tags',
			-variable=>\$action_sel,
			-value=>'--list',
			-width=>57, -anchor=>'w',
		)->pack();
		$w_frame->Radiobutton(
			-text=>'Just show some statistics',
			-variable=>\$action_sel,
			-value=>'--stats',
			-width=>57, -anchor=>'w',
		)->pack();

		# Frame 2: 'Output'. 2 text boxes.
		$w_frame_output=$AdvW->LabFrame(-label=>'Output',)->pack();
		
		$w_frame_output->Label(
			-text=> 
		"   Instead of the same name, use this as the output file base name.\n".
		"   For instance, using new.name.txt as the base name will generate\n".
		" files called new.name.TAG.txt" ,
			-width=>60,
			-anchor=>'w',
			-justify=>'left',
		)->pack();
		

		$w_frame = $w_frame_output->Frame ()->pack();
		
		$w_frame->Entry (
			-width => 40,
			-textvariable => \$out_base,
		)->pack(
			-side=>'left',
		);
		$w_frame->Button (
			-text => 'Browse',
			-command => sub { $out_base= $AdvW->getSaveFile || $out_base; },
		)->pack(
			-side=>'left',
		);


		$w_frame_output->Label(-height=>1)->pack();

		$w_frame = $w_frame_output->Frame()->pack();
		
		$w_frame->Label(
			-text=>'Separator to use in the file name.'.
			"\nExamples: . for file.TAG.ext, - for file-TAG.ext, etc.",
			-width=>50,
			-anchor=>'w',
			-justify=>'left',
		)->pack(-side=>'left',);
		$w_frame->Entry(
			-width=>3,
			-justify=>'center',
			-textvariable=>\$SEP_CHAR
		)->pack(-side=>'left',);


		# Frame 3: 'Tags'. 1 text box.
		$w_frame_tags=$AdvW->LabFrame(-label=>'Tags',)->pack();
		
		$w_frame_tags->Label(
			-text=>
			'   Just process these tags (leave blank to process all of them).'.
			"\n   Use a comma-separated list, for instance en,es,it or just en",
			-width=>60,
			-justify=>'left',
			-anchor=>'w',
		)->pack();
		$w_frame_tags->Entry(
			-width=>40,
			-textvariable=>\$only_tags,
		)->pack();

		
		#   Two buttons: Ok, Cancel. After several hours of reading about this, I
		# decided to put the 'Ok' at the left since most of the options you have to
		# click or text boxes you have to fill are justified to the left.
		$w_frame = $AdvW->Frame ()->pack(-pady=>5,);

		$w_frame->Button(-text=>'Ok',-command=>sub{

				# A bit of preprocessing
				$only_tags =~ s/\s+//g if $only_tags;

				# Save the new settings
				@advanced_options=
				($action_sel, $out_base, $SEP_CHAR, $only_tags);
				
				# Close the window
				$AdvW->destroy; $AdvW="";

			},)->pack(-side=>'left');
		$w_frame->Button(-text=>'Cancel',-command=>sub{
				
				# Cancel. Restore the settings we saved
				($action_sel, $out_base, $SEP_CHAR, $only_tags)
					= @advanced_options;
				
				$AdvW->destroy; $AdvW="";
				
			},)->pack(-side=>'left');
		
		# Advanced options window is now ready and showing

		return; # Yes, this was a sub
		
	}

	# Start the GUI and wait. The buttons will call the subs defined above.
	Tk::MainLoop();

	# The user closed the window. Nothing else to do.
	
} else {
	#   The user supplied some arguments. Don't open GUI. Just process them
	# and print some information, or the errors (if any).

	print ( &dislines(@ARGV) || $@ );
	
}

exit 0;

# And here finished the program








#    Do everything. The parameters are the same as the command line options.
#    Example of how to call it:
# print (&dislines qw( test.txt -t en,it -q ) || $@);
#    or simply:
#    dislines (file.txt);
#
#    Returns:
#    a scalar with some information you would normally want to view on the
# screen (ready to be printed).
#    If it fails, it return undef (false) and sets $@ to the error message
#    Beware: if you use --quiet, it may return "" (so, false) and this is not
# a sign of problem. You'll need to check $@
#
sub dislines (@) {

# We trap errors
eval q[

	# Initializations
	$just_list=$only_tags=$out_base=$just_stats=$quiet=$show_help=$show_version="";

	# Simulate the command line
	@ARGV=@_;
	if ($DEBUG) {print "Parsing these options: @ARGV\n";}
	
	GetOptions (
		"list"    => \$just_list,
		"tags=s"  => \$only_tags,
		"out=s"   => \$out_base,
		"stats"   => \$just_stats,
		"quiet"   => \$quiet,
		"help"    => \$show_help,
		"version" => \$show_version,
	)
		or die "Strange parameters passed. Stopping";

	if ($show_help) { return &show_help(); }
	if ($show_version) { return &show_version(); }

	
	if ( not @ARGV ) {
		die "I need the name of the file to process. See help (-h)\n";
	}

	#   Get just the first file.
	#   'local' because the GUI doesn't want the value to be changing, and we indeed
	# change it to remove the path and print only the basename. So, these changes will
	# be local.
	local $input_file = shift @ARGV;

	
	&open_file();

	
	# Listing tags doesn't need a full text processing
	return &do_list() if $just_list;

	# Create a temporary directory for our files
	&init_temp_files();

	# Do the hard job on all the document
	&text_process();

	# Get some information and delete the temporary files
	return &do_stats() if $just_stats;

	
	# Change the temporary files to the final ones.
	# We get some information about which files were really written.
	return &promote_files();

	
] or return undef; # and setting $@

# The result of this eval is what we return
	

}




#   Prepare the filehandle INPUT for reading
sub open_file () {

	open (INPUT, $input_file) or &system_error("Can't open $input_file");

	warn "Be careful: $input_file doesn't seem a text file. Warning"
		if not $quiet
		and not -T $input_file
		and not $input_file eq "-";


	# Once opened, we just want its name, to shorten a little the printings
	$^O =~ s/^dos$/msdos/i;     # dosemu said just "dos"
	fileparse_set_fstype($^O);  # and this requires "msdos"
	$input_file = basename ($input_file);

	# If not specified, use the same name as the base for the output files
	$out_base ||= $input_file;

	# Don't print messages if we're using STDOUT
	$quiet=1 if $out_base eq "-";

}



# This block has tools to access each temporary file
{

my $hasTemp;   # Says if we have File::Temp
my $temp_dir;  # Where to put all our files
my $counter;   # For our own file name generator

# For each tag, has the name of the temporary file associated
my %names = ();


sub init_temp_files () {

	#   Detect if we have File::Temp (implemented in 5.6.1) to create temporary
	# files safely. Otherwise, use our own temporary file creation.
	#
	$hasTemp=1;
	eval 'use File::Temp qw(tempfile tempdir);';
	$hasTemp=0 if $@;

	$counter="000"; # In case we don't have it, we'll generate our own names

	#   We create a temporary directory, which will be destroyed after exit
	eval '$temp_dir = tempdir( CLEANUP => 1 );';
	die "Could not create temporary directory: $@" if ($hasTemp and $@);

	if ($DEBUG) {print "Our temp directory is $temp_dir\n";}

}


#   Return the filehandle of a newly created temporary file,
# associating it to the specified tag   
sub create_temp_file ($) {
        my $tag = shift;

	my ($fh, $filename);
	
	if ($hasTemp) {   # We have File::Temp :-)
        	eval '($fh, $filename) =
			tempfile( "disl_XXXX", DIR => "' . (quotemeta $temp_dir) . '");';
		
		die "Could not create temporary file: $@" if $@;
	} else {
		# Try to create a good temp file
		# For instance: tempfile.000, tempfile.001, .002, etc.
		$filename = "tempfile.$counter";
		$counter++; # from "000" to "001"
		
		# 'autovivify' on open() is just for >=5.6.0
		# So is the 3 parameters version...
		open ( HANDLE, "+>" . $filename )
			or &system_error("Can't create temporary file");
		$fh=*HANDLE;

	}
		

        $names{$tag}=$filename;

	if ($DEBUG) {print ("Created temp file for tag '$tag': $filename\n");}
        return $fh;

}

#   Returns the name of the temporary file for the given tag
sub temp_file_name ($) {
        return $names{shift};
}

#   Renames the temporary file associated to the specified tag
# to the final output file (whose name is specified)
sub temp_to_final ($$) {
	
	my $old=shift;
	$old=$names{$old};
	my $new=shift;
	
	if ($DEBUG) { print "Renaming $old to $new\n";}
	move( $old, $new )
		or &system_error("Error renaming temporary file");
}

#   Remove the temporary file for the given tag
#   In fact, File::Temp already removes the files on exit, but we have
# already been called to delete some files, so let's delete them ourselves.
sub delete_temp ($) {
	my $tag = shift;
	if ($DEBUG) {print "Deleting temporary file for tag '$tag': $names{$tag}\n";}
	
	# Don't stop if there are problems; we want most files removed
	unlink $names{$tag} or warn("Could not delete temp. file $names{$tag}: $!.");

	delete $names{$tag}; # We need it no more in the hash
}


} # End of the 'temporary files' block







#   Do the real text processing of INPUT file, and leave opened a bunch of temporary
# files, which can later be renamed to the final output files.
sub text_process() {

	# Here starts the text processing
	print "Processing $input_file\n" if not $quiet;


	my $last_tag="";  # Last tag seen ( for @"" )
	my $in_block="";  # Are we inside a block? If so, which tags is it for?
			  # Both variables contain a list of tags, like "en,eo,it"


	# Open buffer for common lines (it's identified as if it had tag "")
	$file{""} = &create_temp_file("");


	# Reset the line counter
	$. = 0;

	# Start reading, line by line and in just one pass
	while ( <INPUT> ) {
		
		my ($command, $rest_of_line);
		
		chomp; # No newlines ( \n ) at the end
		if ($DEBUG) {print "$.: $_\n";}

		($command, $rest_of_line)= /^${AT}+(.*?)(?: (.*))?$/o
			or ($command, $rest_of_line)=("",$_); # Common line (no tag)

		# Handle @en\n and others
		$rest_of_line="" if not defined $rest_of_line;


		# Skip comments: @---
		if ($command =~ /^\-+$/) {
			$lines{"-"}++ if $just_stats;
			next;
		}

		
		# Handle @{ and @}
		
		if ($command =~ /^\{(.*)$/ or $command =~ /^(.*)\{$/) {
			# Opening a block
			&bad_syntax("You can't nest blocks") if $in_block;
			&bad_syntax("Block with no tags") if not $1;
			$in_block=$1;
			if ($DEBUG) {print "Entering block $in_block\n";}
			next;
			
		} elsif ($command =~ /^\}(.*)$/ or $command =~ /^(.*)\}$/) {
			# Closing a block
			&bad_syntax("You closed block $1, but no block was opened")
				if (not $in_block);
			&bad_syntax("You closed block $1, but I was expecting $in_block")
				if ($1 and $1 ne $in_block);
			if ($DEBUG) {print "Going out of block $in_block\n";}
			$in_block="";
			next;

		}




		# Handle blocks, and @""

		if ($in_block) {
			&bad_syntax("Use of tag $command not allowed inside a block")
				if $command ne "";

			# Translate the block @{tag to a simple @tag for each line
			$command=$in_block;
			
		} else { # Things to do when you're not into a block
			$command=$last_tag if $command =~ /"+/;

		}


		if ($command eq "") {
			# Not tagged. It may be a common line, or rest inside a block

			if (not $in_block) { # Common line
				#   Add it to the global buffer ($file{""})
				# and to each known file
				foreach my $tag ( keys %file ) {
					print { $file{$tag} } "$rest_of_line\n";
					$lines{$tag}++ if $just_stats;
				}

				if($DEBUG) {print "Adding common line: $rest_of_line\n";}

				next; # No tags to process
			} else {
				$command=$in_block;
			}
		}
		

		# Handle things like @,,,,
		&bad_syntax("Don't do that with the commas") if $command =~ /^,+$/;

		# Iterate over the t1, t2, t3 of a @t1,t2,t3
		foreach my $tag ( split /,/, $command ) {
			&bad_syntax("Don't include null tag names")
				if $tag eq ""; # as in the case of a @a,,b
			&bad_syntax("Illegal tag name $tag (remove the '$&')")
				if $tag =~ /[\/\\\@\{\}]/;
			
			# now, tag is correct (it doesn't match /[ ,]/ nor /[\@{}]/ )

			if ($tag =~ /^\-*$/) { # it's a comment
				$lines{"-"}++ if $just_stats;
				next;
			}
				

			next if ($only_tags and $only_tags !~ /\b$tag\b/); # Not selected

			if (! $file{$tag} ) { # New tag found

				# Create temporary file for this tag

				local *HANDLE;
				*HANDLE=&create_temp_file($tag);
				$file{$tag}=*HANDLE;

				# Copy all the lines from the global file to this one
				seek ($file{""}, 0, 0)
				and copy(  $file{""} , $file{$tag}  )
					or &system_error("Problem duplicating file");
				
				$lines{$tag}=$lines{""} if $just_stats;

				if ($DEBUG) {print "New tag found: $tag\n";}
			}
		
			# Write in each tag's buffer
			print { $file{$tag} } "$rest_of_line\n";
			$lines{$tag}++ if $just_stats;
		}

		# Make @"" work
		$last_tag=$command if not $in_block;


		if ($DEBUG) {print ">>>>> Command: $command\tLine: $rest_of_line\n";}

	}

	# No more lines to process

	&bad_syntax("You forgot to close block $in_block")
		if $in_block;



}







#   Final step: make the temporary files be the final ones
#   Returns some text about which files did wrote.
sub promote_files () {
		
	close INPUT;

	close $file{""};
	delete $file{""};
	&delete_temp("");

	my $ret_info="";

	foreach my $tag (keys %file) {

		# Are we writing files, or to the standard output?
		if ($out_base ne "-") {
			my $out_name=&out_file_name($tag);
			close $file{$tag};
			&temp_to_final( $tag, $out_name );
			delete $file{$tag};
			$ret_info .= "Wrote $out_name\n" if not $quiet;
			
		} else {
			# Write all files -concatenated- to STDOUT
			# Hope that the user had selected just one with -t

			my $handler = $file{$tag};
			seek $handler, 0, 0;
			print while (   <$handler> );
			close $file{$tag};

			# And delete it. We 'moved' it to STDOUT
			&delete_temp($tag);
			delete $file{$tag};

		}
			
			
	}

	return $ret_info;

}



#   Complain. These errors are trapped by the 'eval' at &dislines
sub bad_syntax ($) {
	my $message = shift;
	$message = "Error at line $.: $message\n";
	&remove_all_temp();
	die $message;
}

sub system_error ($) {
	my $message = shift;
	$message = "$message: $!\n";
	&remove_all_temp();
	die $message;

}

#   Called in case of error, or statistics.
# (Otherwise, the temp files are converted to final ones).
sub remove_all_temp () {
	foreach my $tag (keys %file) {
		&delete_temp($tag);     # Delete its temporary file on the disk
	}
	%file=();   # Also empty the list of known tags
}


#   Decide the output file for each tag
sub out_file_name ($) {

	# From a.html  -> a.TAG.html
	#      a.b.txt -> a.b.TAG.txt
	#      abc     -> abc.TAG
	#

	my $tag=shift;

	my ($name, $dot_ext) = $out_base =~ /^(.*?)(\.[^\.]*)?$/;
	$dot_ext="" if not $dot_ext;

	#         file      .       TAG    .ext
	return "${name}${SEP_CHAR}${tag}${dot_ext}";
}







#   Return a list with the tags used in a document
sub do_list () {

	#   We're not doing a full parse of the file,
	# neither check whether it is valid.
	#   We just search for lines beginning with @ to extract the tags.


	my %seen_tags=();


	while (<INPUT>) {

		if ($DEBUG) {print "$. $_\n";}
		
		# Take the command from the @command Rest_of_line
		next unless /^${AT}+(?!\@)([^ ]+)[ \n]/o;
	       
		if ($DEBUG) {print "The command seems $1\n";}
		
		foreach my $tag (split /[,\{\}]/, $1) {
			next if $tag =~ /[\\\/\@]/; # skip the erroneous tags
			next if not $tag;
			
			# skip @"" and @--
			next if $tag =~ /^\"+$/ or $tag =~ /^\-+$/;
			
			if ($DEBUG) {print "$tag\n";}
			
			$seen_tags{$tag}=1;
		}

	}
	close INPUT;

	my $ret_info="";
	
	$ret_info.="List of tags used in $input_file:\n" if not $quiet;
	$ret_info.="$_\n" for (keys %seen_tags);

	return $ret_info;

}


#   Return some statistics about the document and its tags
sub do_stats () {

	# We have the line count of each file. We can extract some information.
	
	my $total_input_lines = $.;
	my $common_lines = $lines{""} || 0;
	
	my $ret_info= "$input_file ($total_input_lines lines):";
	$ret_info = "$ret_info\n".'-'x(length $ret_info)."\n";

	# Get the maximum number of digits for some values
	my ($longest_tag,$longest_lines)=(0,0);
	foreach my $tag (keys %file) {
		next if $tag eq "";
		
		my $c;
		$c=&length_in_chars($tag);
		$longest_tag=$c if $c > $longest_tag;
		$c=length $lines{$tag};
		$longest_lines=$c if $c > $longest_lines;
	}
	$longest_tag= &length_in_chars(
		&out_file_name( 'x' x $longest_tag )
	); # Length of the full name, not just the largest tag
	

	foreach my $tag (keys %file) {

		close $file{$tag};   # Profit the occasion to close temp files
		
		next if $tag eq "";  # Just real tags; we don't want the global buffer
		
		my $num=$lines{$tag};

		my $name=&out_file_name($tag);
		my $lin="%${longest_lines}u";  # Format string for the line counts
		
		#   Of course, this can be done with "format"s, but wouldn't simplify
		# the code since the records aren't fixed-width.
		$ret_info .=
		sprintf(
			' 'x($longest_tag-&length_in_chars($name)) .
			"%s: $lin lines = " .
			"$lin proper + $lin common\n",
			
		       	$name, $num,
			$num-$common_lines, $common_lines);
		
			
	}
	my $num_tags= scalar(keys %file) -1; # -1 because of the "" (not real)

	$lines{'-'} ||=0;
	
	$ret_info .= "Number of tags: $num_tags. Number of comments: $lines{'-'}.\n\n";

	&remove_all_temp(); # Since we won't create the output files

	%lines=(); # Fresh hash for the next run
	
	
	return $ret_info;

}


sub length_in_chars ($) {

	#   This is a little hack to get the length of a string
	# which we don't know if it's Unicode (UTF-8) or not.
	
	my $a = shift;

	# Perl can't know if $a is Unicode or not

	my $l = length $a; # Take its length as it if weren't
	
	# This sets the "utf8" bit for $b
	my $b;
        eval q{
		$b = pack "U0C*", unpack "C*", $a;
		#   We're hiding this from <5.6.0 versions,
		# which will get the length as if it weren't UTF-8
	};

	# Try to take its length as if it were Unicode
        eval q{
		#   If length detects some error (like malformed UTF-8 characters),
		# die and don't touch $l. Otherwise, it's UTF-8, so get the real $l
	        use warnings FATAL => 'all';
	        $l=length $b;
	};
	
	return $l;

}


sub show_version () {

	return <<"EOF";

dislines $VERSION < http://www.danielclemente.com/dislines/ >
Follows version 1 of the specification.

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, version 2.

July-August 2005. Daniel Clemente Laboreo.

EOF

}





sub show_help () {

	return <<'EOF';

Usage: dislines [OPTIONS] file.ext

Options:

 (nothing)         Process the file and create a file.TAG.ext for each tag
 -l, --list        Just show a list of the tags used in the file
 -t, --tags=LIST   Only include these tags. Ex: en,it,fr
 -o, --out=FILE    Use this base name for the output files (file.TAG.ext)
 -s, --stats       Just print some information about the files to be created
 -q, --quiet       Write only the necessary information to the screen
 -h, --help        Show this help (see the manual for the syntax)
 -v, --version     Print version information

 You may put a dash (-) instead of file names to use STDIN or STDOUT.
 
EOF

}


# The end, really

