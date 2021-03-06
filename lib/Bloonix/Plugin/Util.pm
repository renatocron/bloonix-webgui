package Bloonix::Plugin::Util;

use strict;
use warnings;
use Digest::SHA qw(sha256_hex sha512_hex hmac_sha512);
use MIME::Base64;
use MIME::Lite;
use Time::ParseDate;
use base qw(Bloonix::Accessor);

__PACKAGE__->mk_accessors(qw/c/);

sub new {
    my ($class, $c) = @_;

    return bless { c => $c }, $class;
}

sub sha256 {
    my ($self, $string) = @_;
    $string ||= time.rand(9_999_999);
    return sha256_hex($string)
}

sub sha512 {
    my ($self, $string) = @_;
    $string ||= time.rand().rand();
    return sha512_hex($string)
}

sub pbkdf2 {
    my ($self, $password, $salt, $rounds, $len, $prf) = @_;
    my ($u, $ui);
    my $str = "";
    for (my $k = 1; length($str) < $len; $k++) {
        $u = $ui = &$prf($salt.pack('N', $k), $password);
        for (my $i = 1; $i < $rounds; $i++) {
            $ui = &$prf($ui, $password);
            $u ^= $ui;
        }
        $str .= $u;
    }
    return substr($str, 0, $len);
}

sub pbkdf2_sha512_base64 {
    my ($self, $password, $salt, $rounds, $length) = @_;
    my ($func, $base64);

    $salt //= $self->pwgen(64); # salt
    $rounds //= join("", 1, map { int(rand(9)) } 1..4); # roundsations
    $length //= 64; # returned string length
    $func = \&hmac_sha512; # crypt method
    $base64 = MIME::Base64::encode($self->pbkdf2($password, $salt, $rounds, $length, $func), "");

    return wantarray ? ($base64, $salt, $rounds) : $base64;
}

sub pbkdf2_sha512_base64_verify {
    my ($self, $secret, @opts) = @_;

    my $secret2 = $self->pbkdf2_sha512_base64(@opts);

    return $secret2 eq $secret;
}

sub pwgen {
    my ($self, $num) = @_;
    $num ||= 20;

    my @char = ("a".."z", "A".."Z", 0..9);
    my $len  = scalar @char;
    my $str  = "";

    for my $i (1..$num) {
        my $n = int(rand($len));
        $str .= $char[$n];
    }

    return $str;
}

sub quickmail {
    my ($self, %mail) = @_;

    if (!$mail{to} || !$mail{from}) {
        return 1;
    }

    MIME::Lite->new(
        From => $mail{from},
        To => $mail{to},
        Subject => $mail{subject} || "bloonix quick mail",
        Type => "TEXT",
        Data => $mail{message}
    )->send("sendmail", "/usr/sbin/sendmail -t -oi -oem");

    return 1;
}

sub timestamp {
    my ($self, $time, $zone) = @_;
    my ($old, $tz);

    if ($zone) {
        $tz  = exists $ENV{TZ} ? 1 : 0;
        $old = $ENV{TZ};
        $ENV{TZ} = $zone;
    }

    if ($time && length($time) > 10) {
        $time = $time / 1000;
    }

    $time ||= time;
    my @time = (localtime($time))[reverse 0..5];
    $time[0] += 1900;
    $time[1] += 1;

    if ($zone) {
        if ($tz) {
            $ENV{TZ} = $old;
        } else {
            delete $ENV{TZ};
        }
    }

    if (wantarray) {
        return (sprintf("%04d-%02d-%02d", @time[0..2]), sprintf("%02d:%02d:%02d", @time[3..5]));
    } else {
        return sprintf "%04d-%02d-%02d %02d:%02d:%02d", @time[0..5];
    }
}

sub datestamp {
    my ($self, $time, $zone) = @_;
    my ($old, $tz);

    if ($zone) {
        $tz  = exists $ENV{TZ} ? 1 : 0;
        $old = $ENV{TZ};
        $ENV{TZ} = $zone;
    }

    $time ||= time;
    my @time = (localtime($time))[reverse 0..5];
    $time[0] += 1900;
    $time[1] += 1;

    if ($zone) {
        if ($tz) {
            $ENV{TZ} = $old;
        } else {
            delete $ENV{TZ};
        }
    }

    return sprintf "%04d-%02d-%02d", @time[0..2];
}

sub short_datestamp {
    my $self = shift;
    my $time = $self->datestamp(@_);
    $time =~ s/-\d+\z//;
    return $time;
}

sub time2secs {
    my ($self, $time, $zone) = @_;
    my ($old, $tz);

    if ($zone) {
        $tz  = exists $ENV{TZ} ? 1 : 0;
        $old = $ENV{TZ};
        $ENV{TZ} = $zone;
    }

    eval { $time = Time::ParseDate::parsedate($time) };

    if ($@) {
        return undef;
    }

    if ($zone) {
        if ($tz) {
            $ENV{TZ} = $old;
        } else {
            delete $ENV{TZ};
        }
    }

    return $time;
}

sub time2msecs {
    my $self = shift;
    my $time = $self->time2secs(@_);
    return $time * 1000;
}

sub secs2str {
    my $self = shift;

    my ($s, $m, $h, $d) = (shift, 0, 0, 0);
    $s >= 86400 and $d = sprintf('%i', $s / 86400) and $s = $s % 86400;
    $s >= 3600  and $h = sprintf('%i', $s / 3600)  and $s = $s % 3600;
    $s >= 60    and $m = sprintf('%i', $s / 60)    and $s = $s % 60;

    return wantarray ? ($d, $h, $m, $s) : "$d:$h:$m:$s";
}

sub pager {
    my ($self, %page) = @_;

    # Validation
    foreach my $key (qw/min_entry max_entry current_page entries_per_page/) {
        if (defined $page{$key} && $page{$key} !~ /^\d+\z/) {
            die "invalid value for key '$key'";
        }
    }

    # Some defaults
    $page{entries_per_page} //= 40;
    $page{current_page} //= 1;

    # Check if a array with data are passed
    if (ref $page{total_entries} eq "ARRAY") {
        $page{data} = delete $page{total_entries};
        $page{total_entries} = scalar @{$page{data}};
    }

    if (defined $page{total_entries}) {
        $page{min_entry} = 1;
        $page{max_entry} = $page{total_entries};
    } elsif (defined $page{min_entry} && defined $page{max_entry}) {
        $page{total_entries} = $page{max_entry} - $page{min_entry} + 1;
    } else {
        die "no number of entries passed";
    }

    $page{first_page} = 1;
    $page{last_page}  = int($page{total_entries} / $page{entries_per_page});

    if ($page{last_page} * $page{entries_per_page} < $page{max_entry}) {
        $page{last_page}++;
    }

    if ($page{last_page} < 1) {
        $page{last_page} = 1;
    }

    if ($page{current_page} < $page{first_page} || $page{current_page} > $page{last_page}) {
        $page{current_page} = 1;
    }

    if ($page{current_page} + 1 >= $page{last_page}) {
        $page{next_page} = 0;
    } else {
        $page{next_page} = $page{current_page} + 1;
    }

    if ($page{current_page} - 1 <= $page{first_page}) {
        $page{prev_page} = 0;
    } else {
        $page{prev_page} = $page{current_page} - 1;
    }

    if ($page{reverse}) {
        $page{first_entry} = ($page{max_entry} + 1) - $page{current_page} * $page{entries_per_page};
        $page{last_entry}  = $page{first_entry} + $page{entries_per_page} - 1;

        if ($page{first_entry} < $page{min_entry}) {
            $page{first_entry} = $page{min_entry};
        }

        if ($page{last_entry} < $page{min_entry}) {
            $page{last_entry} = $page{min_entry};
        }
    } else {
        $page{first_entry} = $page{current_page} * $page{entries_per_page} + $page{min_entry} - $page{entries_per_page};
        $page{last_entry}  = $page{first_entry} + $page{entries_per_page} - 1;

        if ($page{first_entry} > $page{max_entry}) {
            $page{first_entry} = $page{max_entry};
        }

        if ($page{last_entry} > $page{max_entry}) {
            $page{last_entry} = $page{max_entry};
        }
    }

    my @array = ();
    $page{array} = \@array;

    if ($page{last_page} <= 10) {
        push @array, (1..$page{last_page});
    } elsif ($page{current_page} - 2 <= $page{first_page}) {
        push @array, (1, 2, 3, 4, "...", $page{last_page});
    } elsif ($page{current_page} + 2 >= $page{last_page}) {
        push @array, (
            1, "...",
            $page{last_page} - 3,
            $page{last_page} - 2,
            $page{last_page} - 1,
            $page{last_page}
        );
    } else {
        push @array, (
            1, "...",
            $page{current_page} - 1,
            $page{current_page},
            $page{current_page} + 1,
            "...", $page{last_page}
        );
    }

    if ($page{data} && $page{total_entries}) {
        my $first = $page{first_entry} - 1;
        my $last = $page{last_entry} - 1;
        $page{data} = [ @{$page{data}}[$first..$last] ];
    }

    return \%page;
}

sub convert_year_month_to_max_date {
    my ($self, $string) = @_;
    my ($year, $month) = split /-/, $string;
    my $febdays = $year % 100 && $year % 4 ? 28 : 29;
    my $day;

    if ($month =~ /^(?:4|6|9|11)\z/) {
        $day = 30;
    } elsif ($month eq "2" || $month eq "02") {
        $day = $year % 100 && $year % 4 ? 28 : 29;
    } else {
        $day = 31;
    }

    return sprintf("%04d-%02d-%02d", $year, $month, $day);
}

sub convert {
    my ($self, $vars) = @_;

    foreach my $key (keys %{$vars}) {
        $vars->{$key} =~ s/^\s+//;
        $vars->{$key} =~ s/\s+\z//;
        $vars->{$key} =~ s/&/&amp;/g;
        $vars->{$key} =~ s/</&lt;/g;
        $vars->{$key} =~ s/>/&gt;/g;
        $vars->{$key} =~ s/"/&quot;/g;
        $vars->{$key} =~ s/\n/<br>/g;
    }

    return $vars;
}

sub ip_by_alias {
    my ($self, $ipaddr) = @_;

    my %ip_by_alias;

    foreach my $alias (split /,/, $ipaddr) {
        if ($alias =~ /^(IPADDR[\w\.\-]+)?=(.+)/) {
            $ip_by_alias{"%$1%"} = $2;
        }
    }

    $ipaddr =~ s/IPADDR.*?=//g;
    $ip_by_alias{"%IPADDR%"} = $ipaddr;

    return \%ip_by_alias;
}

# pv
#   a=b
#   c=d
# to json
#   {"a":"b","c":"d"}
sub pv_to_json {
    my $self = shift;
    my ($key, $data);

    if (@_ == 2) {
        ($key, $data) = @_;
    } else {
        $data = shift;
    }

    my $c = $self->c;
    my $variables = $key ? $data->{$key} : $data;
    $variables //= "";
    my $to_json = {};

    foreach my $pv (split /[\r\n]+/, $variables) {
        next if $pv =~ /^\s*\z/;
        if ($pv =~ /^\s*([a-zA-Z_0-9\-\.]+)\s*=\s*([^\s].*)\z/) {
            my ($p, $v) = ($1, $2);
            $v =~ s/\s*\z//;
            $to_json->{$p} = $v;
        }
    }

    if ($key) {
        $data->{$key} = $c->json->encode($to_json);
        return $data;
    }

    return $c->json->encode($to_json);
}

sub json_to_pv {
    my $self = shift;
    my ($key, $data);

    if (@_ == 2) {
        ($key, $data) = @_;
    } else {
        $data = shift;
    }

    my $c = $self->c;
    my $variables = $key
        ? $c->json->decode($data->{$key})
        : $c->json->decode($data);

    my $to_pv = "";

    foreach my $param (sort keys %$variables) {
        $to_pv .= "$param=$variables->{$param}\n";
    }

    if ($key) {
        $data->{$key} = $to_pv;
        return $data;
    }

    return $to_pv;
}

1;
